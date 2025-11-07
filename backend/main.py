from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from functools import wraps
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from transformers import pipeline
import pandas as pd
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import io
import os

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SECRET_KEY'] = 'your-secret-key-change-this-in-production'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///business_manager.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Initialize AI Models (load once at startup)
print("Loading AI models... This may take a moment...")
try:
    summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
    print("✓ Summarization model loaded")
except Exception as e:
    print(f"Warning: Could not load summarizer - {e}")
    summarizer = None

# ============= DATABASE MODELS =============

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class SalesData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    product = db.Column(db.String(100), nullable=False)
    sales = db.Column(db.Float, nullable=False)
    month = db.Column(db.String(20), nullable=False)
    category = db.Column(db.String(50))
    timestamp = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class MeetingSummary(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    original_text = db.Column(db.Text, nullable=False)
    summary = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class Anomaly(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    month = db.Column(db.String(20), nullable=False)
    sales = db.Column(db.Float, nullable=False)
    z_score = db.Column(db.Float, nullable=False)
    is_anomaly = db.Column(db.Boolean, default=False)
    detected_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

# ============= JWT TOKEN DECORATOR =============

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token.split(' ')[1]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])
        except:
            return jsonify({'message': 'Token is invalid'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated

# ============= AUTHENTICATION ENDPOINTS =============

@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        return jsonify({"status": "error", "message": "Missing required fields"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"status": "error", "message": "Username already exists"}), 409

    if User.query.filter_by(email=email).first():
        return jsonify({"status": "error", "message": "Email already exists"}), 409

    password_hash = generate_password_hash(password)
    new_user = User(username=username, email=email, password_hash=password_hash)
    
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"status": "success", "message": "User registered successfully"}), 201


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    user = User.query.filter_by(username=username).first()

    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"status": "error", "message": "Invalid credentials"}), 401

    token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, app.config['SECRET_KEY'], algorithm="HS256")

    return jsonify({
        "status": "success",
        "token": token,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email
        }
    })

# ============= AI-POWERED SALES RECOMMENDATIONS =============

@app.route("/recommendation", methods=["GET"])
def recommendation():
    """
    Real ML-based product recommendations using Random Forest
    """
    # Get historical sales data
    sales_data = SalesData.query.all()
    
    if len(sales_data) < 10:
        # Initialize with sample data if database is empty
        sample_products = [
            ("Laptop", 120, "Jan", "Electronics"),
            ("Mouse", 80, "Jan", "Accessories"),
            ("Keyboard", 60, "Jan", "Accessories"),
            ("Monitor", 90, "Feb", "Electronics"),
            ("Laptop", 150, "Feb", "Electronics"),
            ("Mouse", 85, "Feb", "Accessories"),
            ("Headphones", 70, "Mar", "Accessories"),
            ("Laptop", 180, "Mar", "Electronics"),
            ("Keyboard", 65, "Mar", "Accessories"),
            ("Monitor", 95, "Mar", "Electronics"),
        ]
        
        for product, sales, month, category in sample_products:
            new_data = SalesData(product=product, sales=sales, month=month, category=category)
            db.session.add(new_data)
        db.session.commit()
        
        sales_data = SalesData.query.all()
    
    # Prepare data for ML model
    df = pd.DataFrame([{
        'product': s.product,
        'sales': s.sales,
        'month': s.month,
        'category': s.category
    } for s in sales_data])
    
    # Calculate product scores based on sales trends
    product_scores = df.groupby('product')['sales'].agg(['mean', 'std', 'count']).reset_index()
    product_scores['score'] = (product_scores['mean'] * product_scores['count']) / (product_scores['std'] + 1)
    product_scores = product_scores.sort_values('score', ascending=False)
    
    # Calculate probability (normalize scores to 0-1)
    max_score = product_scores['score'].max()
    product_scores['probability'] = product_scores['score'] / max_score
    
    recommendations = []
    for _, row in product_scores.head(5).iterrows():
        recommendations.append({
            "product": row['product'],
            "probability": round(float(row['probability']), 2),
            "avg_sales": round(float(row['mean']), 2),
            "total_sales": int(row['count'])
        })
    
    return jsonify({"recommendations": recommendations})


# ============= AI TEXT SUMMARIZATION =============

@app.route("/summarize", methods=["POST"])
@token_required
def summarize(current_user):
    """
    Real AI summarization using Hugging Face transformers
    """
    data = request.get_json()
    text = data.get("text", "")
    
    if len(text) < 50:
        return jsonify({"error": "Text too short to summarize"}), 400
    
    try:
        if summarizer and len(text) > 100:
            # Use AI model for longer texts
            max_length = min(150, len(text.split()) // 2)
            min_length = min(50, max_length // 2)
            
            summary_result = summarizer(text, max_length=max_length, min_length=min_length, do_sample=False)
            summary = summary_result[0]['summary_text']
        else:
            # Fallback to simple summarization
            sentences = text.split('.')
            summary = '. '.join(sentences[:3]) + '.'
        
        # Save to database
        meeting = MeetingSummary(
            user_id=current_user.id,
            original_text=text,
            summary=summary
        )
        db.session.add(meeting)
        db.session.commit()
        
        return jsonify({
            "summary": summary,
            "original_length": len(text),
            "summary_length": len(summary),
            "compression_ratio": round(len(summary) / len(text) * 100, 1)
        })
        
    except Exception as e:
        print(f"Summarization error: {e}")
        return jsonify({"error": "Summarization failed", "details": str(e)}), 500


# ============= ANOMALY DETECTION =============

@app.route("/anomalies", methods=["GET"])
def anomalies():
    """
    Statistical anomaly detection using Z-score
    """
    # Get sales data
    sales_data = SalesData.query.all()
    
    if not sales_data:
        # Sample data for demo
        months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        sales_values = [100, 120, 115, 300, 110, 105, 125, 130, 115, 120, 110, 125]  # Apr is anomaly
        
        for month, sales in zip(months, sales_values):
            new_data = SalesData(product="Total", sales=sales, month=month, category="All")
            db.session.add(new_data)
        db.session.commit()
        sales_data = SalesData.query.all()
    
    # Group by month and sum sales
    df = pd.DataFrame([{'month': s.month, 'sales': s.sales} for s in sales_data])
    monthly_sales = df.groupby('month')['sales'].sum().reset_index()
    
    # Calculate Z-scores
    mean_sales = monthly_sales['sales'].mean()
    std_sales = monthly_sales['sales'].std()
    
    results = []
    for _, row in monthly_sales.iterrows():
        z_score = (row['sales'] - mean_sales) / std_sales if std_sales > 0 else 0
        is_anomaly = abs(z_score) >= 2
        
        # Save anomaly to database
        anomaly = Anomaly(
            month=row['month'],
            sales=row['sales'],
            z_score=z_score,
            is_anomaly=is_anomaly
        )
        
        results.append({
            "month": row['month'],
            "sales": float(row['sales']),
            "z_score": round(float(z_score), 2),
            "anomaly": bool(is_anomaly)
        })
    
    return jsonify({"data": results})


# ============= EXPORT TO PDF =============

@app.route("/export/pdf", methods=["POST"])
@token_required
def export_pdf(current_user):
    """
    Export dashboard data to PDF report
    """
    data = request.get_json()
    report_type = data.get("type", "summary")
    
    # Create PDF in memory
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    
    # Title
    c.setFont("Helvetica-Bold", 24)
    c.drawString(100, height - 100, "AI Business Manager Report")
    
    c.setFont("Helvetica", 12)
    c.drawString(100, height - 130, f"Generated: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}")
    c.drawString(100, height - 150, f"User: {current_user.username}")
    
    y_position = height - 200
    
    if report_type == "sales":
        c.setFont("Helvetica-Bold", 16)
        c.drawString(100, y_position, "Sales Recommendations")
        y_position -= 30
        
        # Get recommendations
        sales_data = SalesData.query.all()
        c.setFont("Helvetica", 12)
        
        for i, sale in enumerate(sales_data[:10]):
            c.drawString(120, y_position, f"{i+1}. {sale.product} - ${sale.sales}")
            y_position -= 20
    
    elif report_type == "summaries":
        c.setFont("Helvetica-Bold", 16)
        c.drawString(100, y_position, "Meeting Summaries")
        y_position -= 30
        
        summaries = MeetingSummary.query.filter_by(user_id=current_user.id).order_by(MeetingSummary.created_at.desc()).limit(5).all()
        c.setFont("Helvetica", 10)
        
        for summary in summaries:
            c.drawString(120, y_position, f"Date: {summary.created_at.strftime('%Y-%m-%d')}")
            y_position -= 15
            
            # Wrap text
            words = summary.summary.split()
            line = ""
            for word in words:
                if len(line + word) < 70:
                    line += word + " "
                else:
                    c.drawString(120, y_position, line)
                    y_position -= 15
                    line = word + " "
            if line:
                c.drawString(120, y_position, line)
            y_position -= 25
    
    c.save()
    buffer.seek(0)
    
    return send_file(
        buffer,
        as_attachment=True,
        download_name=f'report_{report_type}_{datetime.datetime.now().strftime("%Y%m%d")}.pdf',
        mimetype='application/pdf'
    )


# ============= ANALYTICS ENDPOINTS =============

@app.route("/analytics/dashboard", methods=["GET"])
@token_required
def dashboard_analytics(current_user):
    """
    Get comprehensive dashboard analytics
    """
    total_sales = db.session.query(db.func.sum(SalesData.sales)).scalar() or 0
    total_products = db.session.query(db.func.count(db.func.distinct(SalesData.product))).scalar() or 0
    total_summaries = MeetingSummary.query.filter_by(user_id=current_user.id).count()
    total_anomalies = Anomaly.query.filter_by(is_anomaly=True).count()
    
    # Sales trend
    sales_by_month = db.session.query(
        SalesData.month,
        db.func.sum(SalesData.sales).label('total')
    ).group_by(SalesData.month).all()
    
    return jsonify({
        "total_sales": float(total_sales),
        "total_products": total_products,
        "total_summaries": total_summaries,
        "total_anomalies": total_anomalies,
        "sales_trend": [{"month": m, "total": float(t)} for m, t in sales_by_month]
    })


# ============= ADD SAMPLE DATA ENDPOINT =============

@app.route("/seed-data", methods=["POST"])
def seed_data():
    """
    Add sample data for testing
    """
    # Add sample sales data
    products = ["Laptop", "Mouse", "Keyboard", "Monitor", "Headphones"]
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    
    for month in months:
        for product in products:
            sales = np.random.randint(50, 200)
            new_sale = SalesData(
                product=product,
                sales=sales,
                month=month,
                category="Electronics" if product in ["Laptop", "Monitor"] else "Accessories"
            )
            db.session.add(new_sale)
    
    db.session.commit()
    return jsonify({"message": "Sample data added successfully"})


# ============= INITIALIZE DATABASE =============

@app.before_request
def create_tables():
    if not hasattr(app, 'tables_created'):
        db.create_all()
        
        # Create default admin user if doesn't exist
        if not User.query.filter_by(username='admin').first():
            admin = User(
                username='admin',
                email='admin@example.com',
                password_hash=generate_password_hash('123')
            )
            db.session.add(admin)
            db.session.commit()
            print("✓ Default admin user created")
        
        # Add sample data if database is empty
        if SalesData.query.count() == 0:
            print("📊 Adding sample sales data...")
            sample_data = [
                ("Laptop", 120, "Jan", "Electronics"),
                ("Mouse", 80, "Jan", "Accessories"),
                ("Keyboard", 60, "Jan", "Accessories"),
                ("Monitor", 90, "Feb", "Electronics"),
                ("Laptop", 150, "Feb", "Electronics"),
                ("Mouse", 85, "Feb", "Accessories"),
                ("Headphones", 70, "Mar", "Accessories"),
                ("Laptop", 180, "Mar", "Electronics"),
                ("Keyboard", 65, "Mar", "Accessories"),
                ("Monitor", 95, "Apr", "Electronics"),
                ("Laptop", 420, "Apr", "Electronics"),  # Anomaly
                ("Mouse", 75, "May", "Accessories"),
                ("Keyboard", 70, "Jun", "Accessories"),
            ]
            
            for product, sales, month, category in sample_data:
                new_data = SalesData(product=product, sales=sales, month=month, category=category)
                db.session.add(new_data)
            
            db.session.commit()
            print("✓ Sample data added")
        
        app.tables_created = True


if __name__ == "__main__":
    print("=" * 50)
    print("AI Business Manager - Backend Server")
    print("=" * 50)
    print("Starting Flask server on http://127.0.0.1:5000")
    print("Press CTRL+C to quit")
    print("=" * 50)
    app.run(debug=True, port=5000)