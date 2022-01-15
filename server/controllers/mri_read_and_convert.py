from itkwidgets import view
import itkwidgets
import nibabel as nib
from tqdm import tqdm
import pydicom
import time
import os
import random
import sys
import matplotlib.pyplot as plt 
import SimpleITK as sitk

def main():
    nifti_dir = f'{sys.argv[1]}'
    itk_img = sitk.ReadImage(nifti_dir)
    img = sitk.GetArrayFromImage(itk_img)
    imageName = time.time()
    plt.imshow(img[:, int((img.shape[1])/2), :], cmap='gray')
    plt.savefig(f'{os.path.dirname(sys.argv[1])}/{imageName}.png')
    print(f'{os.path.dirname(sys.argv[1])}/{imageName}.png')

main()