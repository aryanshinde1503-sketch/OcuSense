# import tensorflow as tf
# import numpy as np
# import cv2

# def grad_cam(model, img_array, layer_name="conv5_block3_out"):
#     grad_model = tf.keras.models.Model(
#         [model.inputs],
#         [model.get_layer(layer_name).output, model.output]
#     )

#     with tf.GradientTape() as tape:
#         conv_outputs, predictions = grad_model(img_array)
#         loss = predictions[:, np.argmax(predictions[0])]

#     grads = tape.gradient(loss, conv_outputs)[0]
#     weights = tf.reduce_mean(grads, axis=(0, 1))
#     cam = np.dot(conv_outputs[0], weights.numpy())

#     cam = cv2.resize(cam, (224, 224))
#     heatmap = np.maximum(cam, 0)
#     heatmap /= heatmap.max()

#     return heatmap
import torch
import numpy as np
import cv2


def grad_cam(model, image_tensor):
    """
    Generate a Grad-CAM heatmap for a PyTorch ResNet50 model.

    image_tensor:
        Preprocessed image tensor of shape [1, 3, 224, 224]

    Returns:
        heatmap as a NumPy array with values from 0 to 1
    """

    activations = []
    gradients = []

    # Last convolutional block of ResNet50
    target_layer = model.layer4[-1]

    def forward_hook(module, input, output):
        activations.append(output)

    def backward_hook(module, grad_input, grad_output):
        gradients.append(grad_output[0])

    forward_handle = target_layer.register_forward_hook(forward_hook)
    backward_handle = target_layer.register_full_backward_hook(backward_hook)

    try:
        model.zero_grad()

        # Forward pass
        output = model(image_tensor)

        # Select predicted class
        predicted_class = output.argmax(dim=1).item()

        # Backward pass for predicted class
        score = output[0, predicted_class]
        score.backward()

        # Get saved activations and gradients
        activation = activations[0]
        gradient = gradients[0]

        # Average gradients over spatial dimensions
        weights = gradient.mean(dim=(2, 3), keepdim=True)

        # Weighted combination of feature maps
        cam = (weights * activation).sum(dim=1, keepdim=True)

        # ReLU
        cam = torch.relu(cam)

        # Remove batch/channel dimensions
        cam = cam.squeeze().detach().cpu().numpy()

        # Resize to 224x224
        cam = cv2.resize(cam, (224, 224))

        # Normalize to 0-1
        cam -= cam.min()

        if cam.max() > 0:
            cam /= cam.max()

        return cam

    finally:
        forward_handle.remove()
        backward_handle.remove()