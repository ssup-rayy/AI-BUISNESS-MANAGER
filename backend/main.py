from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from functools import wraps
import os

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SECRET_KEY'] = 'your-secret-key-change-this'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///business_manager.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

print("="*60)
print("🚀 AI BUSINESS MANAGER - Backend Server")
print("="*60)

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
        except Exception as e:
            print(f"Token error: {e}")
            return jsonify({'message': 'Token is invalid'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated

# ============= AUTHENTICATION ENDPOINTS =============

@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")

        print(f"🔐 Login attempt - Username: {username}")

        if not username or not password:
            print("❌ Missing username or password")
            return jsonify({"status": "error", "message": "Username and password required"}), 400

        user = User.query.filter_by(username=username).first()

        if not user:
            print(f"❌ User not found: {username}")
            return jsonify({"status": "error", "message": "Invalid credentials"}), 401

        if not check_password_hash(user.password_hash, password):
            print(f"❌ Wrong password for user: {username}")
            return jsonify({"status": "error", "message": "Invalid credentials"}), 401

        # Create token
        token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, app.config['SECRET_KEY'], algorithm="HS256")

        print(f"✅ Login successful for: {username}")

        return jsonify({
            "status": "success",
            "token": token,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email
            }
        })

    except Exception as e:
        print(f"❌ Login error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/register", methods=["POST"])
def register():
    try:
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

        print(f"✅ New user registered: {username}")

        return jsonify({"status": "success", "message": "User registered successfully"}), 201

    except Exception as e:
        print(f"❌ Registration error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


# ============= SALES RECOMMENDATIONS =============

@app.route("/recommendation", methods=["GET"])
def recommendation():
    try:
        sales_data = SalesData.query.all()
        
        # Group by product and calculate stats
        product_stats = {}
        for sale in sales_data:
            if sale.product not in product_stats:
                product_stats[sale.product] = {'sales': [], 'count': 0}
            product_stats[sale.product]['sales'].append(sale.sales)
            product_stats[sale.product]['count'] += 1
        
        recommendations = []
        for product, stats in product_stats.items():
            avg_sales = sum(stats['sales']) / len(stats['sales'])
            total_sales = sum(stats['sales'])
            
            # Simple scoring: higher avg and more data points = higher probability
            score = (avg_sales * stats['count']) / 1000  # Normalize
            probability = min(score / 10, 0.99)  # Cap at 0.99
            
            recommendations.append({
                "product": product,
                "probability": round(probability, 2),
                "avg_sales": round(avg_sales, 2),
                "total_sales": int(stats['count'])
            })
        
        # Sort by probability
        recommendations.sort(key=lambda x: x['probability'], reverse=True)
        
        return jsonify({"recommendations": recommendations})
    
    except Exception as e:
        print(f"❌ Recommendation error: {e}")
        return jsonify({"recommendations": []})


# ============= TEXT SUMMARIZATION =============

@app.route("/summarize", methods=["POST"])
@token_required
def summarize(current_user):
    try:
        data = request.get_json()
        text = data.get("text", "")
        
        if len(text) < 50:
            return jsonify({"error": "Text too short to summarize"}), 400
        
        # Simple summarization: take first 3 sentences
        sentences = text.replace('!', '.').replace('?', '.').split('.')
        sentences = [s.strip() for s in sentences if s.strip()]
        
        # Take first 3 sentences or up to 150 characters
        summary_sentences = []
        summary_length = 0
        for sentence in sentences[:5]:
            if summary_length + len(sentence) < 150:
                summary_sentences.append(sentence)
                summary_length += len(sentence)
            else:
                break
        
        summary = '. '.join(summary_sentences) + '.'
        
        # Save to database
        meeting = MeetingSummary(
            user_id=current_user.id,
            original_text=text,
            summary=summary
        )
        db.session.add(meeting)
        db.session.commit()
        
        print(f"✅ Summary created for user: {current_user.username}")
        
        return jsonify({
            "summary": summary,
            "original_length": len(text),
            "summary_length": len(summary),
            "compression_ratio": round(len(summary) / len(text) * 100, 1)
        })
        
    except Exception as e:
        print(f"❌ Summarization error: {e}")
        return jsonify({"error": str(e)}), 500


# ============= ANOMALY DETECTION =============

@app.route("/anomalies", methods=["GET"])
def anomalies():
    try:
        # Get sales data grouped by month
        sales_data = SalesData.query.all()
        
        if not sales_data:
            print("⚠️ No sales data found")
            return jsonify({"data": []})
        
        # Group by month
        monthly_sales = {}
        for sale in sales_data:
            if sale.month not in monthly_sales:
                monthly_sales[sale.month] = 0
            monthly_sales[sale.month] += sale.sales
        
        # Calculate mean and std
        values = list(monthly_sales.values())
        mean_val = sum(values) / len(values)
        
        # Calculate standard deviation
        variance = sum((x - mean_val) ** 2 for x in values) / len(values)
        std_val = variance ** 0.5
        
        # Calculate z-scores
        results = []
        for month, sales in monthly_sales.items():
            z_score = (sales - mean_val) / std_val if std_val > 0 else 0
            is_anomaly = abs(z_score) >= 2
            
            results.append({
                "month": month,
                "sales": float(sales),
                "z_score": round(float(z_score), 2),
                "anomaly": bool(is_anomaly)
            })
        
        # Sort by month order
        month_order = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        results.sort(key=lambda x: month_order.index(x["month"]) if x["month"] in month_order else 999)
        
        print(f"✅ Anomalies calculated: {len([r for r in results if r['anomaly']])} found")
        
        return jsonify({"data": results})
    
    except Exception as e:
        print(f"❌ Anomalies error: {e}")
        return jsonify({"data": []})


# ============= INITIALIZE DATABASE =============

def init_database():
    """Initialize database with sample data"""
    with app.app_context():
        # Create tables
        db.create_all()
        print("✅ Database tables created")
        
        # Check if admin exists
        admin = User.query.filter_by(username='admin').first()
        if not admin:
            admin = User(
                username='admin',
                email='admin@example.com',
                password_hash=generate_password_hash('123')
            )
            db.session.add(admin)
            db.session.commit()
            print("✅ Admin user created (username: admin, password: 123)")
        else:
            print("✅ Admin user already exists")
        
        # Check if sample data exists
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
                ("Laptop", 420, "Apr", "Electronics"),  # Anomaly!
                ("Mouse", 75, "May", "Accessories"),
                ("Keyboard", 70, "Jun", "Accessories"),
                ("Monitor", 100, "Jul", "Electronics"),
            ]
            
            for product, sales, month, category in sample_data:
                new_data = SalesData(product=product, sales=sales, month=month, category=category)
                db.session.add(new_data)
            
            db.session.commit()
            print("✅ Sample data added successfully")
        else:
            print("✅ Sample data already exists")


# ============= DATA MANAGEMENT ENDPOINTS =============

@app.route("/add-sales", methods=["POST"])
@token_required
def add_sales(current_user):
    """
    Add new sales data
    Body: {
        "product": "Laptop",
        "sales": 150.50,
        "month": "Jan",
        "category": "Electronics"
    }
    """
    try:
        data = request.get_json()
        
        required_fields = ["product", "sales", "month"]
        for field in required_fields:
            if field not in data:
                return jsonify({"status": "error", "message": f"Missing field: {field}"}), 400
        
        new_sale = SalesData(
            product=data["product"],
            sales=float(data["sales"]),
            month=data["month"],
            category=data.get("category", "Uncategorized")
        )
        
        db.session.add(new_sale)
        db.session.commit()
        
        print(f"✅ New sales entry added: {data['product']} - ${data['sales']}")
        
        return jsonify({
            "status": "success",
            "message": "Sales data added successfully",
            "data": {
                "id": new_sale.id,
                "product": new_sale.product,
                "sales": new_sale.sales,
                "month": new_sale.month,
                "category": new_sale.category
            }
        }), 201
        
    except Exception as e:
        print(f"❌ Add sales error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/bulk-add-sales", methods=["POST"])
@token_required
def bulk_add_sales(current_user):
    """
    Add multiple sales entries at once
    Body: {
        "sales": [
            {"product": "Laptop", "sales": 150, "month": "Jan", "category": "Electronics"},
            {"product": "Mouse", "sales": 25, "month": "Jan", "category": "Accessories"}
        ]
    }
    """
    try:
        data = request.get_json()
        sales_list = data.get("sales", [])
        
        if not sales_list:
            return jsonify({"status": "error", "message": "No sales data provided"}), 400
        
        added_count = 0
        for sale_data in sales_list:
            new_sale = SalesData(
                product=sale_data["product"],
                sales=float(sale_data["sales"]),
                month=sale_data["month"],
                category=sale_data.get("category", "Uncategorized")
            )
            db.session.add(new_sale)
            added_count += 1
        
        db.session.commit()
        print(f"✅ Bulk sales added: {added_count} entries")
        
        return jsonify({
            "status": "success",
            "message": f"{added_count} sales entries added successfully"
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"❌ Bulk add error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/get-all-sales", methods=["GET"])
@token_required
def get_all_sales(current_user):
    """Get all sales data"""
    try:
        sales = SalesData.query.order_by(SalesData.timestamp.desc()).all()
        
        results = []
        for sale in sales:
            results.append({
                "id": sale.id,
                "product": sale.product,
                "sales": sale.sales,
                "month": sale.month,
                "category": sale.category,
                "timestamp": sale.timestamp.strftime("%Y-%m-%d %H:%M:%S")
            })
        
        return jsonify({"status": "success", "data": results})
        
    except Exception as e:
        print(f"❌ Get sales error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/delete-sales/<int:sale_id>", methods=["DELETE"])
@token_required
def delete_sales(current_user, sale_id):
    """Delete a sales entry"""
    try:
        sale = SalesData.query.get(sale_id)
        
        if not sale:
            return jsonify({"status": "error", "message": "Sales entry not found"}), 404
        
        db.session.delete(sale)
        db.session.commit()
        
        print(f"✅ Sales entry deleted: ID {sale_id}")
        
        return jsonify({"status": "success", "message": "Sales entry deleted"})
        
    except Exception as e:
        print(f"❌ Delete error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/update-sales/<int:sale_id>", methods=["PUT"])
@token_required
def update_sales(current_user, sale_id):
    """Update a sales entry"""
    try:
        sale = SalesData.query.get(sale_id)
        
        if not sale:
            return jsonify({"status": "error", "message": "Sales entry not found"}), 404
        
        data = request.get_json()
        
        if "product" in data:
            sale.product = data["product"]
        if "sales" in data:
            sale.sales = float(data["sales"])
        if "month" in data:
            sale.month = data["month"]
        if "category" in data:
            sale.category = data["category"]
        
        db.session.commit()
        
        print(f"✅ Sales entry updated: ID {sale_id}")
        
        return jsonify({
            "status": "success",
            "message": "Sales entry updated",
            "data": {
                "id": sale.id,
                "product": sale.product,
                "sales": sale.sales,
                "month": sale.month,
                "category": sale.category
            }
        })
        
    except Exception as e:
        print(f"❌ Update error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


# ============= HEALTH CHECK =============

@app.route("/", methods=["GET"])
def health_check():
    return jsonify({
        "status": "running",
        "message": "AI Business Manager Backend",
        "endpoints": ["/login", "/register", "/recommendation", "/summarize", "/anomalies"]
    })


# ============= RUN SERVER =============

if __name__ == "__main__":
    print("="*60)
    print("Initializing database...")
    print("="*60)
    
    init_database()
    
    print("="*60)
    print("🚀 Server starting on http://127.0.0.1:5000")
    print("="*60)
    print("\n📝 Test login with:")
    print("   Username: admin")
    print("   Password: 123")
    print("\n⌨️  Press CTRL+C to quit\n")
    
    app.run(debug=True, port=5000)