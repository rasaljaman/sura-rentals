# sura-rentels
Car rentals website created using react js and django

## Getting Started

If you have the project folder on your device and want to push it to this GitHub repository for the first time, follow these steps.

### Prerequisites

- [Git](https://git-scm.com/downloads) must be installed on your device.
  - On Android, you can use [Termux](https://termux.dev/) and run `pkg install git`.
- A GitHub account with access to this repository.

### Steps

1. **Open a terminal** and navigate to your project folder:

   ```bash
   cd path/to/sura-rentels
   ```

2. **Initialize a Git repository** (skip this step if `.git` folder already exists):

   ```bash
   git init
   ```

3. **Add all your files** to the staging area:

   ```bash
   git add .
   ```

4. **Commit your files**:

   ```bash
   git commit -m "Initial commit"
   ```

5. **Add the remote GitHub repository** as the origin:

   ```bash
   git remote add origin https://github.com/rasaljaman/sura-rentels.git
   ```

6. **Push your code** to GitHub:

   ```bash
   git push -u origin main
   ```

   > **Note:** If your default branch is named `master` instead of `main`, use `git push -u origin master`.

### Authenticating with GitHub

When prompted for credentials, use your GitHub username and a **Personal Access Token (PAT)** as the password (GitHub no longer accepts plain passwords).

To create a PAT:
1. Go to **GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens**.
2. Click **Generate new token**, grant it **Contents** read/write access to this repository, and copy the token.
3. Use this token as your password when Git asks for it.

   > Alternatively, you can use **Tokens (classic)** and select the `repo` scope, but fine-grained tokens are recommended.
