# Endless Runner Lens

[English](README.md) | [Українська](README.ua.md)

![Lens Studio](https://img.shields.io/badge/Built%20With-Lens%20Studio-yellow)
![JavaScript](https://img.shields.io/badge/Code-JavaScript-blue)
![Platform](https://img.shields.io/badge/Platform-Snapchat-green)
![Status](https://img.shields.io/badge/Status-Playable-brightgreen)

A simple endless runner game created with **Lens Studio** for Snapchat.

Run forward, avoid obstacles, collect prizes, and try to beat your high score.

## Requirements

To open, edit, or run this project locally you need:

- **Lens Studio** (latest version recommended)
- Snapchat account (optional, for mobile testing)
- Windows or macOS

## Setup

This project uses **Git LFS** for large asset files.

It is recommended to clone the repository instead of downloading ZIP archives.

```bash
git clone <repo-url>
cd <project-folder>
git lfs install
git lfs pull
```

Downloading the project as ZIP may result in missing or broken asset references inside Lens Studio.

## Preview Mode

For the best gameplay preview inside Lens Studio, use:

- **World** mode

Some other preview environments (such as Idle / Face modes) may affect camera framing and are intended for AR testing rather than gameplay.

## Gameplay

- Move between 3 lanes
- Jump over obstacles
- Collect prizes to earn score
- 3 hearts (lives)
- Game speed increases over time
- High score is saved locally
- Restart instantly after Game Over

## Demo

![Demo](docs/demo.gif)

## Controls

### Desktop / Editor

- **Left Arrow** — move left  
- **Right Arrow** — move right  
- **Up Arrow** or **Space** — jump  
- **Mouse Drag Left / Right** — move  
- **Mouse Drag Up** — jump  
- **Any Tap / Click / Input** on start screen — start game

### Mobile

- **Swipe Left** — move left  
- **Swipe Right** — move right  
- **Swipe Up** — jump  
- **Tap / Swipe** on start screen — start game

## Built With

- Lens Studio
- JavaScript

## Features

- Object pooling
- Dynamic difficulty scaling
- Score system
- High score save system
- UI effects
- Sound effects
- Character animations