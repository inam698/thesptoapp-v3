# 🐍 PYTHON FOR ENGINEERS: FROM ZERO TO PROTOTYPE
*A 10-Session Practical Curriculum for the FabLab*

## 🎯 COURSE OBJECTIVE
To move from absolute zero to building a functional, hardware-connected Python application. Each session is 90% hands-on and 10% theory.

---

## 🟢 PHASE 1: THE FOUNDATIONS (EASY)

### **Session 1: The Setup & "Hello Engineering"**
*   **Concepts:** Installing Python/VS Code, the REPL, and Print statements.
*   **Activity:** Write your first script to calculate the area of a 3D-printed part.
*   **Key takeaway:** Python is just a powerful calculator.

### **Session 2: Boxes for Data (Variables & Types)**
*   **Concepts:** Numbers (Integers/Floats), Strings (Text), and Booleans (True/False).
*   **Activity:** Create a "Bill of Materials" script that stores a component name, its price, and whether it's in stock.
*   **Key takeaway:** How to organize lab data in code.

### **Session 3: Making Decisions (Logic & If-Else)**
*   **Concepts:** Comparison operators (`>`, `<`, `==`) and If/Else statements.
*   **Activity:** Build a "Safety Interlock" simulator. *If* the temperature is > 100°C, print "STOP MACHINE"; *Else*, print "COOLING OK".
*   **Key takeaway:** Logic controls hardware.

### **Session 4: Task Automation (Loops)**
*   **Concepts:** `for` loops (doing things X times) and `while` loops (doing things until a condition changes).
*   **Activity:** Write a script that "tests" 10 parts in a row and prints a report.
*   **Key takeaway:** Let the computer do the boring, repetitive work.

---

## 🟡 PHASE 2: POWER TOOLS (INTERMEDIATE)

### **Session 5: Cleaning Up (Functions & Modules)**
*   **Concepts:** Reusable code (`def`), parameters, and importing libraries (`import math`).
*   **Activity:** Create a tool that calculates different physics formulas (Stress, Strain, Ohms Law) based on user input.
*   **Key takeaway:** Don't write the same code twice.

### **Session 6: Organizing Collections (Lists & Dictionaries)**
*   **Concepts:** Storing many items in one variable.
*   **Activity:** Build a "Lab Inventory Search" tool where you can look up a component and get its drawer location.
*   **Key takeaway:** Python is excellent for managing databases.

### **Session 7: Handling Real-World Mess (Files & Errors)**
*   **Concepts:** Reading/Writing `.txt` and `.csv` files. Using `try-except` to prevent crashes.
*   **Activity:** Design a "Data Logger" that saves sensor readings into an Excel-friendly file.
*   **Key takeaway:** Data is only useful if you save it for later.

---

## 🔴 PHASE 3: HARDWARE & AI (ADVANCED)

### **Session 8: Python Meets Hardware (The Serial Port)**
*   **Concepts:** Using the `pyserial` library.
*   **Activity:** Connect a Python script on your laptop to an Arduino/ESP32. Send a command from Python to turn on a physical LED in the lab.
*   **Key takeaway:** Python can control the physical world.

### **Session 9: Visualizing Engineering Data (Matplotlib)**
*   **Concepts:** Graphing and plotting data.
*   **Activity:** Take your saved sensor data from Session 7 and generate a professional engineering graph of "Stress vs Strain".
*   **Key takeaway:** One graph is worth 1,000 data points.

### **Session 10: Final Project - The Smart Lab Assistant**
*   **Objective:** Combine everything!
*   **Project Idea:** Build a script that reads a sensor, decides if it's safe (Logic), logs the result (Files), and shows a live graph (Visualization).
*   **Final Output:** A fully functional Python application for your engineering portfolio.

---

## 🛠️ REQUIRED TOOLS
1.  **Software:** Python 3.12, VS Code, Git.
2.  **Libraries:** `pyserial`, `matplotlib`, `pandas`.
3.  **Hardware (for Phase 3):** Arduino Uno or ESP32 + USB Cable.

---

### 🚀 WHY THIS WORKS
This curriculum follows the **"FabLab Way"**: We don't learn theory for the sake of it. We learn a concept (like Loops) and immediately apply it to a real engineering problem (testing parts).
