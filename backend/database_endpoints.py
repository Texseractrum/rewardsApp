import os
from supabase import create_client, Client
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS

# Load environment variables from .env file if it exists
load_dotenv()

# Get Supabase credentials from environment variables
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", key)  # Fallback to regular key if service key not available

# Initialize Supabase clients
supabase: Client = create_client(url, key)  # For user operations
admin_supabase: Client = create_client(url, service_key)  # For admin operations that bypass RLS

# Create Flask app
app = Flask(__name__)
# Enable CORS for all routes and origins
CORS(app, resources={r"/*": {"origins": "*"}})

# Customer registration endpoint
@app.route('/api/customer/add', methods=['POST'])
def add_customer():
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['customer_name', 'customer_email']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Insert customer data using admin client to bypass RLS
        customer_data = {
            "customer_name": data['customer_name'],
            "customer_email": data['customer_email']
        }
        
        # Insert into Customers table
        response = admin_supabase.table("Customers").insert(customer_data).execute()
        
        # Get the customer ID from the response
        customer_id = response.data[0]['id'] if response.data else None
        
        return jsonify({
            "success": True,
            "message": "Customer added successfully",
            "customer_id": customer_id,
            "data": response.data[0] if response.data else None
        })
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Shop registration endpoint
@app.route('/api/shop/add', methods=['POST'])
def add_shop():
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['shop_name', 'shop_email']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Insert shop data using admin client to bypass RLS
        shop_data = {
            "shop_name": data['shop_name'],
            "shop_email": data['shop_email']
        }
        
        # Add optional fields if provided
        optional_fields = ['address', 'phone', 'website', 'description', 'business_hours', 'category']
        for field in optional_fields:
            if field in data:
                shop_data[field] = data[field]
        
        # Insert into Shops table
        response = admin_supabase.table("Shops").insert(shop_data).execute()
        
        # Get the shop ID from the response
        shop_id = response.data[0]['id'] if response.data else None
        
        return jsonify({
            "success": True,
            "message": "Shop added successfully",
            "shop_id": shop_id,
            "data": response.data[0] if response.data else None
        })
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Get customers endpoint
@app.route('/api/customers', methods=['GET'])
def get_customers():
    try:
        # Query parameters for filtering
        email = request.args.get('email')
        search = request.args.get('search')
        
        # Start building the query
        query = supabase.table("Customers").select("*")
        
        # Apply filters if provided
        if email:
            query = query.eq("customer_email", email)
        
        if search:
            query = query.ilike("customer_name", f"%{search}%")
        
        # Execute the query
        response = query.execute()
        
        return jsonify(response.data)
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Get shops endpoint
@app.route('/api/shops', methods=['GET'])
def get_shops():
    try:
        # Query parameters for filtering
        email = request.args.get('email')
        search = request.args.get('search')
        
        # Start building the query
        query = supabase.table("Shops").select("*")
        
        # Apply filters if provided
        if email:
            query = query.eq("shop_email", email)
        
        if search:
            query = query.ilike("shop_name", f"%{search}%")
        
        # Execute the query
        response = query.execute()
        
        return jsonify(response.data)
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Run the app
if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    print(f"Starting Flask server on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=True)




