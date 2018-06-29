<p align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/6/65/HackerRank_logo.png" height="200" style="padding: 15px;">
</p>

# hackerrank.js
### A JavaScript framework for running HackerRank challenges on your local machine.

#### Requirements:

- Node v6+

#### Installation:

``` bash
# Clone/fork the repository
git clone --depth 1 https://github.com/itho/hackerrank.js.git

# Change directory
cd hackerrank

# Install dependencies
npm install
```

#### Usage:

1. On all HackerRank challenges, you can see a link on the right side bar "Download sample test cases".
Clicking this will start the download of the available input &amp; output files.
2. Save this to the 'challenges' subdirectory and create a file named 'solution.js'. Copy in the stub from HackerRank and get hacking!
3. Run the commands below from the root of the project.

``` bash
# If your codes outputs to the console/stdout
node hackerrank.js challenges/solve-me-first --console
node hackerrank.js challenges/solve-me-first --stdout

# If your code outputs to a file
node hackerrank.js challenges/solve-me-first --file
```

4. You can also add additional/custom testcases. Just ensure that the input and output filenames match.

#### Examples:

<p align="center">
  <img src="https://raw.githubusercontent.com/itho/hackerrank.js/master/docs/screenshots/failure.png" style="padding: 15px;">
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/itho/hackerrank.js/master/docs/screenshots/success.png" style="padding: 15px;">
</p>

#### License

itho/hackerrank is [MIT licensed](https://github.com/itho/hackerrank.js/blob/master/license).
