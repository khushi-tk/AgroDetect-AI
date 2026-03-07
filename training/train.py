import tensorflow as tf
from training.dataset import load_data
from training.model import build_model

train_ds, num_classes = load_data()

model = build_model(num_classes)

early_stop = tf.keras.callbacks.EarlyStopping(
    monitor='loss',
    patience=3,
    restore_best_weights=True
)

model.fit(train_ds, epochs=20, callbacks=[early_stop])

model.save("saved_models/plant_disease_model.h5")