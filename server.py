# TODO: Verify JSON queries in a more python way
# TODO: Implement this:
# https://flask-verify.readthedocs.io/en/latest/tutorial/json_verify_tutorial.html
"""Flask API to make GET and POST requests to a MariaDB server"""
import base64
import json
import sys
import uuid
from io import BytesIO

import mariadb
from flask import Flask, request
from flask_cors import CORS, cross_origin
from PIL import Image

app = Flask(__name__)
cors = CORS(app)


@app.route("/videos", methods=["GET"])
@cross_origin()
def get_block():
    """Handle GET Requests"""
    if request.method == "GET":
        video_id = request.args["video_id"]
        return select(video_id)
    return "ERROR"


@app.route("/videos", methods=["POST"])
@cross_origin()
def post_block():
    """Handle POST Requests"""
    if request.method == "POST":
        if "data" in request.json.keys():
            save_image(request)
        else:
            return insert(request)
    return "ERROR"


def base64_to_image(base64_string):
    """ Convert base64 from API POST request to (image) bytes, then return """
    # Source: https://codebeautify.org/blog/how-to-convert-base64-to-image-using-python/
    # Remove the data URI prefix if present
    if "data:image" in base64_string:
        base64_string = base64_string.split(",")[1]

    # Decode the Base64 string into bytes
    image_bytes = base64.b64decode(base64_string)
    return image_bytes


def create_image_from_bytes(image_bytes):
    """ Convert (image) bytes to an image, then return """
    # Source: https://codebeautify.org/blog/how-to-convert-base64-to-image-using-python/
    # Create a BytesIO object to handle the image data
    image_stream = BytesIO(image_bytes)

    # Open the image using Pillow (PIL)
    image = Image.open(image_stream)
    return image


def save_image(req_data):
    """ Save image from POST request to a file """
    # Source: https://codebeautify.org/blog/how-to-convert-base64-to-image-using-python/
    print("Saving request...")
    # Replace this with your Base64 string
    base64_string = req_data.json["data"]

    # Convert Base64 to image bytes
    image_bytes = base64_to_image(base64_string)

    # Create an image from bytes
    img = create_image_from_bytes(image_bytes)

    # Display or save the image as needed
    # Generate uuid for file name
    file_dir = "./img"
    file_name = str(uuid.uuid4())
    file_extension = "jpg"
    file = f"{file_dir}/{file_name}.{file_extension}"
    img.show()
    img.save(file)
    print("Request saved...")


def insert(request_data):
    """Insert data using SQL query to MariaDB server"""
    conn, cursor = connect_to_mariadb()
    # --- Example: Select Data ---
    print("\nInserting data...")

    # Check if the JSON has all components, catch KeyError
    try:
        website = "https://youtube.com"
        video_id = request_data.json["video_id"]
        x_cord = request_data.json["x_cord"]
        y_cord = request_data.json["y_cord"]
        length = request_data.json["length"]
        height = request_data.json["height"]
        x_res = request_data.json["x_res"]
        y_res = request_data.json["y_res"]
    except KeyError:
        print("JSON request was improperly formatted.")
        return "JSON request was improperly formatted.", 201

    insert_query = f"""INSERT INTO VIDEOS
    (website, video_id, x_cord, y_cord, length, height, x_res, y_res)
    VALUES
    ('{website}', '{video_id}', {x_cord}, {y_cord}, {length}, {height}, {x_res}, {y_res});"""

    # Note the comma for single parameter tuple
    cursor.execute(insert_query)
    conn.commit()

    cursor.connection.close()
    return "DONE", 200


def select(video_id):
    """Make SQL query to get needed data based on YouTube Video ID"""
    _, cursor = connect_to_mariadb()
    # --- Example: Select Data ---
    print("\nSelecting data...")
    select_query = f"""SELECT website, video_id, x_cord, y_cord,
    length, height, x_res, y_res FROM VIDEOS WHERE video_id='{video_id}'"""

    # Note the comma for single parameter tuple
    cursor.execute(select_query)

    # Jsonify the results somehow
    # Source: https://stackoverflow.com/questions/3286525/return-sql-table-as-json-in-python
    r = [
        dict((cursor.description[i][0], value) for i, value in enumerate(row))
        for row in cursor.fetchall()
    ]
    if r == []:
        return 400
    cursor.connection.close()
    return json.dumps(r[0] if r else None), 200


def connect_to_mariadb():
    """Make connection to MariaDB server, return connection and cursor"""
    # Connect to Mariadb
    # Source:https://mariadb.com/docs/connectors/connectors-quickstart-guides/connector-python-guide
    try:
        conn = mariadb.connect(
            user="root",
            password="pass",
            host="127.0.0.1",
            port=3306,
            database="caption_capper",
        )
    except mariadb.Error as e:
        print(f"Error connecting to MariaDB Platform: {e}")
        sys.exit(1)

    # Get Cursor
    cursor = conn.cursor()
    return conn, cursor


if __name__ == "__main__":
    app.run(debug=True)
