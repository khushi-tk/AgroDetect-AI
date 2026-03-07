import tensorflow as tf

IMG_SIZE = 128
BATCH_SIZE = 32

def load_data():

    train_ds = tf.keras.utils.image_dataset_from_directory(
        "data/PlantVillage",
        image_size=(IMG_SIZE, IMG_SIZE),
        batch_size=BATCH_SIZE
    )

    class_names = train_ds.class_names
    num_classes = len(class_names)

    return train_ds, num_classes