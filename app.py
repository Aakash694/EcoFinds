from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_marshmallow import Marshmallow
from werkzeug.utils import secure_filename
import os
import uuid
from datetime import datetime
from PIL import Image
import json

app = Flask(_name_)
CORS(app)

# Configuration
app.config['SECRET_KEY'] = 'ecofinds-secret-key-2024'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///ecofinds.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Initialize extensions
db = SQLAlchemy(app)
ma = Marshmallow(app)

# Create upload directory if it doesn't exist
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

# Allowed image extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Models
class Listing(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    price = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    location = db.Column(db.String(50), nullable=False)
    seller_name = db.Column(db.String(50), nullable=False)
    seller_phone = db.Column(db.String(15), nullable=False)
    images = db.Column(db.Text)  # JSON string of image filenames
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)

    def _init_(self, title, description, price, category, location, seller_name, seller_phone, images=None):
        self.title = title
        self.description = description
        self.price = price
        self.category = category
        self.location = location
        self.seller_name = seller_name
        self.seller_phone = seller_phone
        self.images = images or '[]'

class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    display_name = db.Column(db.String(50), nullable=False)
    icon = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(100))

    def _init_(self, name, display_name, icon, description=None):
        self.name = name
        self.display_name = display_name
        self.icon = icon
        self.description = description

# Marshmallow schemas
class ListingSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Listing
        load_instance = True
    
    images = ma.Method("get_images")
    
    def get_images(self, obj):
        try:
            return json.loads(obj.images) if obj.images else []
        except:
            return []

class CategorySchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Category
        load_instance = True

# Initialize schemas
listing_schema = ListingSchema()
listings_schema = ListingSchema(many=True)
category_schema = CategorySchema()
categories_schema = CategorySchema(many=True)

# Utility functions
def resize_image(image_path, max_size=(800, 600)):
    """Resize image to reduce file size while maintaining quality"""
    try:
        with Image.open(image_path) as img:
            img.thumbnail(max_size, Image.Resampling.LANCZOS)
            img.save(image_path, optimize=True, quality=85)
    except Exception as e:
        print(f"Error resizing image: {e}")

# API Routes
@app.route('/')
def home():
    return jsonify({
        'message': 'Welcome to EcoFinds API',
        'version': '1.0.0',
        'endpoints': {
            'listings': '/api/listings',
            'categories': '/api/categories',
            'search': '/api/search',
            'upload': '/api/upload'
        }
    })

# Categories endpoints
@app.route('/api/categories', methods=['GET'])
def get_categories():
    categories = Category.query.all()
    return jsonify(categories_schema.dump(categories))

@app.route('/api/categories/<string:category_name>/count', methods=['GET'])
def get_category_count(category_name):
    count = Listing.query.filter_by(category=category_name, is_active=True).count()
    return jsonify({'category': category_name, 'count': count})

# Listings endpoints
@app.route('/api/listings', methods=['GET'])
def get_listings():
    try:
        # Get query parameters
        category = request.args.get('category', 'all')
        location = request.args.get('location', 'all')
        search = request.args.get('search', '')
        sort_by = request.args.get('sort', 'newest')
        min_price = request.args.get('min_price', type=float)
        max_price = request.args.get('max_price', type=float)
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)

        # Build query
        query = Listing.query.filter_by(is_active=True)

        # Apply filters
        if category != 'all':
            query = query.filter_by(category=category)
        
        if location != 'all':
            query = query.filter_by(location=location)
        
        if search:
            search_term = f'%{search}%'
            query = query.filter(
                db.or_(
                    Listing.title.like(search_term),
                    Listing.description.like(search_term)
                )
            )
        
        if min_price is not None:
            query = query.filter(Listing.price >= min_price)
        
        if max_price is not None:
            query = query.filter(Listing.price <= max_price)

        # Apply sorting
        if sort_by == 'newest':
            query = query.order_by(Listing.created_at.desc())
        elif sort_by == 'oldest':
            query = query.order_by(Listing.created_at.asc())
        elif sort_by == 'price-low':
            query = query.order_by(Listing.price.asc())
        elif sort_by == 'price-high':
            query = query.order_by(Listing.price.desc())

        # Paginate results
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        listings = pagination.items

        return jsonify({
            'listings': listings_schema.dump(listings),
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page,
            'per_page': per_page,
            'has_next': pagination.has_next,
            'has_prev': pagination.has_prev
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/listings/<int:listing_id>', methods=['GET'])
def get_listing(listing_id):
    listing = Listing.query.get_or_404(listing_id)
    if not listing.is_active:
        return jsonify({'error': 'Listing not found'}), 404
    return jsonify(listing_schema.dump(listing))

@app.route('/api/listings', methods=['POST'])
def create_listing():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['title', 'description', 'price', 'category', 'location', 'seller_name', 'seller_phone']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400

        # Create new listing
        listing = Listing(
            title=data['title'],
            description=data['description'],
            price=float(data['price']),
            category=data['category'],
            location=data['location'],
            seller_name=data['seller_name'],
            seller_phone=data['seller_phone'],
            images=json.dumps(data.get('images', []))
        )

        db.session.add(listing)
        db.session.commit()

        return jsonify({
            'message': 'Listing created successfully',
            'listing': listing_schema.dump(listing)
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/listings/<int:listing_id>', methods=['PUT'])
def update_listing(listing_id):
    try:
        listing = Listing.query.get_or_404(listing_id)
        data = request.get_json()

        # Update fields if provided
        if 'title' in data:
            listing.title = data['title']
        if 'description' in data:
            listing.description = data['description']
        if 'price' in data:
            listing.price = float(data['price'])
        if 'category' in data:
            listing.category = data['category']
        if 'location' in data:
            listing.location = data['location']
        if 'seller_name' in data:
            listing.seller_name = data['seller_name']
        if 'seller_phone' in data:
            listing.seller_phone = data['seller_phone']
        if 'images' in data:
            listing.images = json.dumps(data['images'])

        listing.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify({
            'message': 'Listing updated successfully',
            'listing': listing_schema.dump(listing)
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/listings/<int:listing_id>', methods=['DELETE'])
def delete_listing(listing_id):
    try:
        listing = Listing.query.get_or_404(listing_id)
        listing.is_active = False  # Soft delete
        listing.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify({'message': 'Listing deleted successfully'})

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# File upload endpoint
@app.route('/api/upload', methods=['POST'])
def upload_files():
    try:
        if 'files' not in request.files:
            return jsonify({'error': 'No files provided'}), 400

        files = request.files.getlist('files')
        uploaded_files = []

        for file in files:
            if file and file.filename and allowed_file(file.filename):
                # Generate unique filename
                filename = str(uuid.uuid4()) + '_' + secure_filename(file.filename)
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                
                # Save file
                file.save(filepath)
                
                # Resize image
                resize_image(filepath)
                
                uploaded_files.append(filename)

        return jsonify({
            'message': f'{len(uploaded_files)} files uploaded successfully',
            'files': uploaded_files
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Serve uploaded files
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Search endpoint
@app.route('/api/search', methods=['GET'])
def search_listings():
    query = request.args.get('q', '')
    category = request.args.get('category', 'all')
    location = request.args.get('location', 'all')
    
    if not query:
        return jsonify({'listings': [], 'total': 0})

    # Build search query
    search_query = Listing.query.filter_by(is_active=True)
    search_term = f'%{query}%'
    search_query = search_query.filter(
        db.or_(
            Listing.title.like(search_term),
            Listing.description.like(search_term)
        )
    )

    if category != 'all':
        search_query = search_query.filter_by(category=category)
    
    if location != 'all':
        search_query = search_query.filter_by(location=location)

    listings = search_query.order_by(Listing.created_at.desc()).limit(50).all()

    return jsonify({
        'listings': listings_schema.dump(listings),
        'total': len(listings),
        'query': query
    })

# Statistics endpoint
@app.route('/api/stats', methods=['GET'])
def get_stats():
    total_listings = Listing.query.filter_by(is_active=True).count()
    categories_count = db.session.query(Listing.category, db.func.count(Listing.id)).filter_by(is_active=True).group_by(Listing.category).all()
    locations_count = db.session.query(Listing.location, db.func.count(Listing.id)).filter_by(is_active=True).group_by(Listing.location).all()

    return jsonify({
        'total_listings': total_listings,
        'categories': dict(categories_count),
        'locations': dict(locations_count)
    })

# Initialize database and seed data
def init_db():
    db.create_all()
    
    # Add default categories if they don't exist
    if Category.query.count() == 0:
        categories = [
            Category('cars', 'Cars', 'fas fa-car', 'Used cars & vehicles'),
            Category('mobiles', 'Mobiles', 'fas fa-mobile-alt', 'Smartphones & tablets'),
            Category('electronics', 'Electronics', 'fas fa-laptop', 'Gadgets & appliances'),
            Category('furniture', 'Furniture', 'fas fa-couch', 'Home & office furniture'),
            Category('fashion', 'Fashion', 'fas fa-tshirt', 'Clothing & accessories'),
            Category('real-estate', 'Properties', 'fas fa-home', 'Houses & apartments'),
            Category('books', 'Books', 'fas fa-book', 'Educational & novels'),
            Category('sports', 'Sports', 'fas fa-football-ball', 'Sports & fitness'),
        ]
        
        for category in categories:
            db.session.add(category)
        
        db.session.commit()
        print("Categories seeded successfully!")

    # Add sample listings if database is empty
    if Listing.query.count() == 0:
        sample_listings = [
            Listing(
                title="iPhone 13 - Excellent condition",
                description="Barely used iPhone 13 128GB in mint condition. All accessories included. No scratches or dents.",
                price=45000,
                category="mobiles",
                location="mumbai",
                seller_name="Rajesh Kumar",
                seller_phone="9876543210"
            ),
            Listing(
                title="Honda City 2018 - Well maintained",
                description="Honda City VTi CVT 2018 model. Single owner, full service history. AC, power steering, ABS.",
                price=850000,
                category="cars",
                location="bangalore",
                seller_name="Priya Sharma",
                seller_phone="8765432109"
            ),
            Listing(
                title="MacBook Air M1 - Like new",
                description="MacBook Air M1 2021, 8GB RAM, 256GB SSD. Used for 6 months only. Box and charger included.",
                price=75000,
                category="electronics",
                location="delhi",
                seller_name="Amit Singh",
                seller_phone="7654321098"
            ),
            Listing(
                title="Sofa Set - 3+2 seater",
                description="Beautiful fabric sofa set in excellent condition. Very comfortable and stylish. Smoke-free home.",
                price=25000,
                category="furniture",
                location="pune",
                seller_name="Meera Patel",
                seller_phone="6543210987"
            ),
            Listing(
                title="Designer Sarees - Silk Collection",
                description="Collection of 5 designer silk sarees, barely worn. Perfect for weddings and festivals.",
                price=8000,
                category="fashion",
                location="chennai",
                seller_name="Lakshmi Iyer",
                seller_phone="5432109876"
            )
        ]
        
        for listing in sample_listings:
            db.session.add(listing)
        
        db.session.commit()
        print("Sample listings added successfully!")

if _name_ == '_main_':
    with app.app_context():
        init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)
