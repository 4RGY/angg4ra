---
title: "File Organizer"
description: "Desktop app built with Python and Tkinter that automatically tidies up thousands of college and freelance files based on filename keywords."
status: "Completed"
tags: ["Python", "Tkinter", "Threading", "Desktop App", "PyInstaller"]
category: "Web"
language: "en"
metric: "Turned a chaotic 'Downloads' folder into 17 structured folders in one click"
date: "2024-09-12"
featured: false
github: "https://github.com/4RGY/organize_files"
---

## Concept

Most students, especially the ones moonlighting as freelancers like me, share one common enemy: a Downloads folder full of hundreds of randomly named files, piling up semester after semester with no real system. Assignments, course materials, and freelance gigs all blend together, and finding one specific file in that mess can take longer than actually doing the work itself.

**File Organizer** came out of the most practical need possible. **"**how do I clean all this up without dragging and dropping every single file by hand?**"** This app is a simple desktop tool that builds an academic folder structure instantly, then sorts the messy files into place based on keywords hiding in their own filenames.

## Design Approach

The app follows one core principle: *zero friction*. No database setup, no complicated installation. Just run it, pick a folder, click a few buttons, and it's done.

To keep the experience clear and uncluttered, the interface is split into three tabs, each with its own responsibility:
* **Main Tab:** Where you pick the base folder and run the two core actions: building the folder structure and executing the sort.
* **Keywords Tab:** Configuration for mapping destination folder names to their trigger keywords, so the system stays flexible whenever a new course comes along.
* **Activity Logs Tab:** A real-time history of every file move, complete with stats on total entries, successfully moved files, and any errors that come up.

There's a quiet satisfaction in watching the progress bar climb from 0 to 100% while the status text shifts to "Processing... 12/47 files", like watching chaos turn into order right in front of you.

## Technical

This project was built on a *no external dependency* ; everything runs on Python's standard library so it can run on any machine without the hassle of installing extra packages.

* **Core Architecture:** Tkinter as the GUI framework, paired with `ttk` for more modern components like Notebook (tabs) and Progressbar.
* **File Moving Logic:** Every file in the `02_File_Berantakan` folder gets matched against a keyword dictionary. The moment there's a match, `shutil.move()` is called and the file lands in its destination folder.
* **Concurrency:** The organizing process runs on a separate `threading.Thread` so the GUI doesn't freeze while large files are being moved, keeping the progress bar and status text responsive.
* **Distribution:** Repackaged into a standalone `.exe` using PyInstaller (`organize.spec`), so friends without Python installed can still use it.

```python
self.file_mappings = {
    "00_Jokian": ["0000", "jokian", "orderan"],
    "03_Tugas_Pemrograman": ["0003", "tugasPemrograman"],
    "05_Tugas_Design_Interface_User": ["0005", "tugasDesign", "tugasui", "tugasux"],
    # ...etc, 17 destination folders total
}
```

### Biggest Challenge
Keeping the GUI responsive while moving hundreds of files at once. The first attempt ran synchronously on the main thread, and the result was the Tkinter window going "Not Responding" for the entire process, making the progress bar look frozen when it was actually working fine. The fix was moving the file-transfer process into its own thread, then syncing UI updates back to the main thread through `root.after()`, so the status and progress bar stayed smooth without hanging the app.

### Reflection
Unlike other projects chased for a thesis or a portfolio, File Organizer was born purely out of personal frustration with messy folders. No complex architecture, no machine learning, no cloud deployment. It is just a small tool that consistently solves a small problem.

The only metric that matters for this project is opening the Downloads folder after months of piled-up freelance work and assignments, hitting one button, and watching everything settle into its proper home within seconds. Sometimes the best solution isn't the fanciest one, it's the one you actually use the most.
