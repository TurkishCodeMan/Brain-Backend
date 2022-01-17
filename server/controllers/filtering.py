import cv2 as cv
import numpy as np
import sys
import time
import os
import matplotlib.pyplot as plt
from math import log10, sqrt

path = f"{sys.argv[1]}"

def PSNR(original, compressed):
    mse = np.mean((original - compressed) ** 2)
    if(mse == 0):  # MSE is zero means no noise is present in the signal .
                  # Therefore PSNR have no importance.
        return 100
    max_pixel = 255.0
    psnr = 20 * log10(max_pixel / sqrt(mse))
    return psnr

def noise_reduction(path):
    mri = cv.imread(path)
    mri_noise = cv.fastNlMeansDenoising(mri)
    value1 = PSNR(mri, mri_noise)
    fig, ax = plt.subplots(1, 2)
    imageName = time.time()
    ax[0].imshow(mri)
    ax[0].axis('off')
    ax[0].title.set_text('Original')
    ax[1].imshow(mri_noise)
    ax[1].axis('off')
    ax[1].text(0.5,-0.2, 'psnr: ' + str(value1), size=10, ha="center", 
          transform=ax[1].transAxes)
    ax[1].title.set_text('Noise Reduction')
    fig.savefig(f'{os.path.dirname(sys.argv[1])}/{imageName}.png')
    print(f'{os.path.dirname(sys.argv[1])}/{imageName}.png')

noise_reduction(path)