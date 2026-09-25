export function reconstructBitmap(imageData, threshold = 128, isPortraitMode = false) {
    let outputImageWidth = 320;
    let outputImageHeight = 120;

    if (isPortraitMode) {
        outputImageWidth = 120;
        outputImageHeight = 320;
    }

    let scale = 4;
    if (isPortraitMode === false) {
        scale = Math.floor(imageData.width / outputImageWidth);
    } else {
        scale = Math.floor(imageData.height / outputImageHeight);
    }

    const bordersSize = scale * 30;

    const outputImage = new ImageData(outputImageWidth, outputImageHeight);
    for (let y = 0; y < outputImageHeight; y++) {
        for (let x = 0; x < outputImageWidth; x++) {
            let blockStartX;
            let blockStartY;

            if (isPortraitMode === false) {
                blockStartX = x * scale;
                blockStartY = y * scale + bordersSize;
            } else {
                blockStartX = x * scale + bordersSize;
                blockStartY = y * scale;
            }

            let sumRGB = 0;
            let pixelCounter = 0;
            let brightness = 0;

            if (scale > 2) {
                // loop through all pixels in a block except for ones on outer edge
                for (let offsetY = 1; offsetY <= scale - 2; offsetY++) {
                    for (let offsetX = 1; offsetX <= scale - 2; offsetX++) {
                        const pixelRGB = getPixelRGB(
                            imageData,
                            blockStartX + offsetX,
                            blockStartY + offsetY,
                            imageData.width
                        );
                        sumRGB += pixelRGB.r + pixelRGB.g + pixelRGB.b;
                        pixelCounter++;
                    }
                }

                brightness = sumRGB / (pixelCounter * 3);
            } else if (scale === 2) {
                // loop through all pixels in a block
                for (let offsetY = 0; offsetY <= scale - 1; offsetY++) {
                    for (let offsetX = 0; offsetX <= scale - 1; offsetX++) {
                        const pixelRGB = getPixelRGB(
                            imageData,
                            blockStartX + offsetX,
                            blockStartY + offsetY,
                            imageData.width
                        );
                        sumRGB += pixelRGB.r + pixelRGB.g + pixelRGB.b;
                        pixelCounter++;
                    }
                }

                brightness = sumRGB / (pixelCounter * 3);
            } else {
                // just get the upper-left pixel as a fallback for scale <= 1
                const pixelRGB = getPixelRGB(imageData, blockStartX, blockStartY, imageData.width);
                brightness = (pixelRGB.r + pixelRGB.g + pixelRGB.b) / 3;
            }

            if (brightness < threshold) {
                setPixelBlack(outputImage, x, y, outputImageWidth);
            } else {
                setPixelWhite(outputImage, x, y, outputImageWidth);
            }
        }
    }

    return outputImage;
}

function getPixelRGB(imageData, x, y, imageWidth) {
    const index = (y * imageWidth + x) * 4;
    return {
        r: imageData.data[index],
        g: imageData.data[index + 1],
        b: imageData.data[index + 2]
    };
}

function setPixelBlack(imageData, x, y, imageWidth) {
    const index = 4 * (imageWidth * y + x);
    imageData.data[index + 0] = 0;     // R
    imageData.data[index + 1] = 0;     // G
    imageData.data[index + 2] = 0;     // B
    imageData.data[index + 3] = 255;   // A
}

function setPixelWhite(imageData, x, y, imageWidth) {
    const index = 4 * (imageWidth * y + x);
    imageData.data[index + 0] = 255;   // R
    imageData.data[index + 1] = 255;   // G
    imageData.data[index + 2] = 255;   // B
    imageData.data[index + 3] = 255;   // A
}