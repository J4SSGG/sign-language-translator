#!/usr/bin/env python3 
# ML dependencies
import numpy as np
import cv2
import keras
import base64
from keras import preprocessing
from keras import layers
from keras.models import Sequential
from sklearn.preprocessing import normalize


# mapa de clases
class_names = ['A', 'C', 'E', 'I', 'L', 'O', 'R', 'U', '2', '3', '4', '5', '6', '7', '8', '9', '10', ' ']
# variable de configuracion
img_height = 50
img_width = 50
new_model = None
# funcionalidades

def load_model(modelName):
    model = keras.models.load_model(modelName)
    print(model.summary())
    return model

def translate_prediction(prediction):
    if(len(class_names) >= int(prediction)):
        return class_names[int(prediction)]
    return ""

def preprocess_image(image):
    image = cv2.cvtColor((image), cv2.COLOR_BGR2GRAY)
    _, image = cv2.threshold(image, 100, 255, cv2.THRESH_BINARY)
    image = cv2.bitwise_not(image)    
    cv2.imwrite("l.jpg", image)
    image = cv2.resize(image, (img_width, img_height))
    image = np.array(image, dtype=np.float32)    
    image = np.reshape(image, (1, img_width, img_height, 1)) # match con modelo Keras
    return image

def predict(image):
    # prediccion
    predictions = new_model.predict(image)[0]
    # mapear prediccion
    # score = predictions / np.linalg.norm(predictions)
    score = normalize(predictions[:,np.newaxis], axis=0).ravel()
    prediction = np.argmax(score)
    accuracy = np.max(score)
    letter = translate_prediction(prediction)
    #return "This image most likely belongs to {} (index: {}) with a {:.2f} percent confidence.".format(translate_prediction(prediction), prediction, 100 * np.max(score))
    return prediction, accuracy, letter



def readImage(image):
    decoded_data = image.read()
    nparr = np.fromstring(decoded_data, dtype=np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_UNCHANGED)
    # preprocesa imagen
    image = preprocess_image(image)
    return image

# REST API dependencies
from flask import Flask, jsonify, request
app = Flask(__name__)

# turn on model
print("Loading model...")
new_model = load_model(modelName = "model.h5")


@app.route("/", methods=["GET"])
def index():
    return jsonify({ "on": True })

@app.route("/image", methods=["POST"])
def image():
    imageFile = request.files['image']
    image = readImage(imageFile)
    prediction, accuracy, letter = predict(image)
    prediction = int(prediction)
    accuracy = "{:.2f}".format(100 * accuracy)
    return jsonify({ "prediction": prediction, "accuracy": accuracy, "letter" : letter })

if __name__ == '__main__':
    app.run(host='0.0.0.0',port="80",debug=True)