let currentImageIndex = 0;

const images = [
    "image_folder/JudiAI_door_closed2.png",
    "image_folder/test1.gif",
    // ...add as many images as you like
];

const changeImage = () => {
    currentImageIndex++;

    // Loop back to the first image if we've gone past the last one
    if (currentImageIndex >= images.length) {
        currentImageIndex = 0;
    }

    const imageElement = document.getElementById('mainImage');

    // For sliding effect:
    imageElement.style.transform = 'translateX(-100%)';
    setTimeout(() => {
        imageElement.src = images[currentImageIndex];
        imageElement.style.transform = 'translateX(0)';
    }, 400);
};

const image1 = document.getElementById('image1');
const image2 = document.getElementById('image2');

const animateImages = () => {
    // Step 2: Shrink and move first image to the left
    image1.style.width = '50%';
    image1.style.left = '-50%';

    // Wait for the first animation to complete
    setTimeout(() => {
        // Step 3: Show the second image and slide it up
        image2.style.opacity = '1';
        image2.style.width = '50%';
        image2.style.bottom = '50%';

        // Wait for the second animation to complete
        setTimeout(() => {
            // Step 4: Make the second image a bit bigger
            image2.style.width = '60%';
            image2.style.bottom = '40%';
        }, 1000); // Adjust duration to match the CSS transition time
    }, 1000); // Adjust duration to match the CSS transition time
};

// Trigger the animation
image1.addEventListener('click', animateImages);
