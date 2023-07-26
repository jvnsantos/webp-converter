const sharp = require("sharp");
const fs = require("fs").promises;
const path = require("path");
const prompt = require("prompt-sync")();

// Define output and input directories
const OUTPUT_DIR = "./OUTPUT";
const INPUT_DIR = "./INPUT";

// Prompt user for a new file name pattern
const nPattern = prompt("Do you want convert all images file to .webp (y/n): ");

if (nPattern == "y") {
  // Define a function to convert image files to WebP format
  let index = 1;
  const convertToWebp = async (img, imgName, outputDir) => {
    // Use sharp to convert the image to WebP format and save it to the output directory
    await sharp(path.join(INPUT_DIR, img))
      .webp()
      .toFile(path.join(outputDir, `${imgName}.webp`));
  };

  // Define a function to process a directory and its subdirectories
  const processDirectory = async (dir, outputDir) => {
    const files = await fs.readdir(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const isDirectory = (await fs.lstat(filePath)).isDirectory();

      if (isDirectory) {
        const newOutputDir = path.join(outputDir, file);
        await fs.mkdir(newOutputDir, { recursive: true });
        await processDirectory(filePath, newOutputDir);
      } else {
        const ext = path.extname(file).toLowerCase();
        if (ext === ".png" || ext === ".jpg" || ext === ".jpeg") {
          const imgName = path.parse(file).name;
          await convertToWebp(
            path.relative(INPUT_DIR, filePath),
            imgName,
            outputDir
          );
          index++;
        }
      }
    }
  };

  async function convertImages() {
    try {
      // If output directory exists, remove it and its contents
      try {
        await fs.access(OUTPUT_DIR, fs.constants.F_OK);
        await fs.rm(OUTPUT_DIR, { recursive: true, force: true });
      } catch (err) {
        // Directory does not exist or cannot be accessed
      }

      // Create the output directory
      await fs.mkdir(OUTPUT_DIR, { recursive: true });

      // Start the conversion process from the INPUT_DIR
      console.log("Conversion in progress...");
      await processDirectory(INPUT_DIR, OUTPUT_DIR);

      console.log(`${index} images affected`)
      console.log("Conversion completed successfully!");
    } catch (error) {
      console.error("Error occurred during conversion:", error);
    }
  }

  convertImages();
}
