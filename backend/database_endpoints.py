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

if url == None or key == None:
    raise ValueError("Please provide SUPABASE_URL and SUPABASE_KEY environment variables")

supabase: Client = create_client(url, key)  # For user operations

# Create Flask app
app = Flask(__name__)
# Enable CORS for all routes and origins
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Accept", "Authorization"],
        "supports_credentials": False
    }
})

# Add OPTIONS handling for all routes
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Accept,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Content-Type', 'application/json')
    return response

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
        response = supabase.table("Customers").insert(customer_data).execute()

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

        response = supabase.table("Shops").insert(shop_data).execute()

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

# New transaction endpoint
@app.route('/api/newtransaction', methods=['POST'])
def add_transaction():
    try:
        print("Received transaction request")
        data = request.json
        print(f"Request data: {data}")

        # Validate required fields
        required_fields = ['shop_id', 'points', 'code_id']
        for field in required_fields:
            if field not in data:
                print(f"Missing required field: {field}")
                return jsonify({"error": f"Missing required field: {field}"}), 400

        # Insert transaction data using admin client to bypass RLS
        transaction_data = {
            "shop_id": data['shop_id'],
            "points_earned": data['points'],
            "code_id": data['code_id']
        }

        print(f"Attempting to insert data: {transaction_data}")
        # Insert into Transactions table
        response = supabase.table("Transactions").insert(transaction_data).execute()
        print(f"Supabase response: {response}")

        return jsonify({
            "success": True,
            "message": "Transaction added successfully",
            "data": response.data[0] if response.data else None
        })

    except Exception as e:
        import traceback
        error_traceback = traceback.format_exc()
        print(f"Error in transaction endpoint: {str(e)}")
        print(f"Traceback: {error_traceback}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/validatetransaction', methods=['POST'])
def validate_transaction():
    try:
        data = request.json
        print(f"Received validation request: {data}")

        required_field = ['customer_id', 'code_id']

        for field in required_field:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400

        # First, check if the transaction exists and is not already validated
        response = supabase.table("Transactions").select("*").eq("code_id", data['code_id']).execute()
        
        if not response.data:
            return jsonify({"error": "Invalid QR code or transaction not found"}), 404
            
        transaction = response.data[0]
        
        # Check if transaction is already validated (has a customer_id)
        if transaction.get('customer_id'):
            return jsonify({"error": "Transaction already validated"}), 400
            
        # Get the points from the transaction
        points_to_add = transaction.get('points_earned', 0)
        
        # Get current customer points
        customer_response = supabase.table("Customers").select("points").eq("customer_id", data['customer_id']).execute()
        
        if not customer_response.data:
            return jsonify({"error": "Customer not found"}), 404
            
        current_points = customer_response.data[0].get('points', 0)
        new_points = current_points + points_to_add
        
        # Update both the transaction and customer points in a single response
        update_response = supabase.table("Transactions").update({
            "customer_id": data['customer_id']
        }).eq("code_id", data['code_id']).execute()
        
        if not update_response.data:
            return jsonify({"error": "Failed to update transaction"}), 500
            
        # Update customer points
        customer_update = supabase.table("Customers").update({
            "points": new_points
        }).eq("customer_id", data['customer_id']).execute()
        
        if not customer_update.data:
            return jsonify({"error": "Failed to update customer points"}), 500
            
        return jsonify({
            "success": True,
            "message": "Transaction validated successfully",
            "data": {
                "transaction": update_response.data[0],
                "customer": customer_update.data[0]
            }
        })

    except Exception as e:
        print(f"Error in validate_transaction: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/getpoints', methods=['POST', 'OPTIONS'])
def get_customer_points():
    if request.method == 'OPTIONS':
        return '', 204
        
    try:
        # Get points for customer_id = 1
        customer_id = 1  # Hardcoded as requested
        response = supabase.table("Customers").select("points").eq("customer_id", customer_id).execute()
        
        if not response.data:
            return jsonify({
                "success": False,
                "error": "Customer not found"
            }), 404
            
        # Ensure points is a number
        points = int(response.data[0].get('points', 0))
        
        return jsonify({
            "success": True,
            "customer_id": customer_id,
            "points": points
        }), 200

    except Exception as e:
        print(f"Error in get_customer_points: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    print(f"Starting Flask server on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=True)
