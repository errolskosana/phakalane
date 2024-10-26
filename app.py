from flask import Flask, jsonify, request, render_template
import requests
from bs4 import BeautifulSoup
import six
import sys
import site
from six import moves
cStringIO = moves.cStringIO
from io import StringIO

app = Flask(__name__)

# Update this home route
@app.route('/')
def home():
    return jsonify({
        "endpoints": [
            "/api/prices",
            "/api/occupancy"
        ],
        "status": "ok"
    })

# Rest of your existing code remains the same
# Fetch Booking.com prices
def fetch_booking_prices(hotel_name):
    url = f"https://www.booking.com/searchresults.html?ss={hotel_name.replace(' ', '+')}&dest_id=-1390980&dest_type=city"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')

    # Find the price on the page (update selector as needed)
    price_elements = soup.select('.price')  # Placeholder selector
    if price_elements:
        price = price_elements[0].text.strip()
        return price
    return "Not available"

@app.route('/api/prices', methods=['GET'])
def get_prices():
    hotels = ["Grand Palm Hotel", "Avani Gaborone Resort & Casino", "Cresta Lodge Gaborone", "Masa Square Hotel"]
    prices = {hotel: fetch_booking_prices(hotel) for hotel in hotels}
    return jsonify(prices)

# Load occupancy data from upload.txt
def load_occupancy_data(file_path='upload.txt'):
    occupancy = {}
    with open(file_path, 'r') as file:
        lines = file.readlines()
        for line in lines:
            day, percentage = line.strip().split(':')
            occupancy[day.strip()] = int(percentage.strip())
    return occupancy

@app.route('/api/occupancy', methods=['GET'])
def get_occupancy():
    occupancy_data = load_occupancy_data()
    return jsonify(occupancy_data)

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

if __name__ == '__main__':
    app.run(debug=True)
