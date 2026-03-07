import tensorflow as tf
import numpy as np
from tensorflow.keras.preprocessing import image
import numpy as np

IMG_SIZE = 128

# Load model
model = tf.keras.models.load_model("saved_models/plant_disease_model.h5")

# Load class names
import os
class_names = sorted(os.listdir("data/PlantVillage"))

def predict_image(img_path):
    img = image.load_img(img_path, target_size=(IMG_SIZE, IMG_SIZE))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0) / 255.0

    predictions = model.predict(img_array)
    predicted_class = class_names[np.argmax(predictions)]

    print("Predicted disease:", predicted_class)

# Test image
predict_image("/mnt/d/Download_D/Potato-leaf-blight.jpg")  