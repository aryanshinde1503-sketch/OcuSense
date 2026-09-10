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
    activations = []
    gradients = []

    target_layer = model.layer4[-1]

    def forward_hook(module, input, output):
        activations.append(output)

    def backward_hook(module, grad_input, grad_output):
        gradients.append(grad_output[0])

    forward_handle = target_layer.register_forward_hook(forward_hook)
    backward_handle = target_layer.register_full_backward_hook(backward_hook)

    try:
        model.zero_grad(set_to_none=True)

        # Do not calculate gradients for model parameters.
        for param in model.parameters():
            param.requires_grad_(False)

        # We only need gradient information flowing through the image.
        image_tensor = image_tensor.clone().detach().requires_grad_(True)

        output = model(image_tensor)

        predicted_class = output.argmax(dim=1).item()
        score = output[0, predicted_class]

        score.backward()

        activation = activations[0]
        gradient = gradients[0]

        weights = gradient.mean(dim=(2, 3), keepdim=True)

        cam = (weights * activation).sum(dim=1, keepdim=True)
        cam = torch.relu(cam)

        # cam = cam.squeeze().detach().cpu().numpy()
        # cam = cv2.resize(cam, (224, 224))
        cam = cam.squeeze().detach().cpu().numpy().astype(np.float32)
        cam = cv2.resize(cam, (224, 224))

        cam -= cam.min()

        if cam.max() > 0:
            cam /= cam.max()

        return cam

    finally:
        forward_handle.remove()
        backward_handle.remove()