# 🎓 LECTURE SERIES: PYTHON FOR ENGINEERING SYSTEMS
**Subject:** Applied Programming for Hardware & Prototyping
**Level:** Undergraduate / Professional Development
**Instructor:** FabLab Faculty

---

## 📘 MODULE 1: THE FOUNDATIONS
*“Everything is a calculation.”*

### **Lecture 1: The Engineering Environment**
*   **Lecture Notes:**
    *   Python exists in two forms: **Script Mode** (writing files) and **Interactive Mode** (the REPL). Think of the REPL as your digital multimeter—use it to test values quickly.
    *   Installation check: Always run `python --version` to ensure you are on 3.10+.
*   **Study Objective:** Successfully calculate the "Volume of a 3D Print Spool" using basic operators (`+`, `-`, `*`, `/`).
*   **Teacher's Hint:** In engineering, `3.14` is a float. `3` is an integer. Mixing them results in a float. Watch your data precision!

*   **Tools for this Module:**
    *   Python 3.10+
    *   Visual Studio Code with the "Python" extension.
*   **Additional Exercises:**
    1.  **Area Calculation:** Write a script to calculate and print the surface area of a laser-cut rectangle with a width of 50.5mm and a height of 100.1mm.
    2.  **Component Spec Sheet:** Create variables to store the key specifications of a NEMA 17 stepper motor: `step_angle` (1.8), `voltage` (12), and `current_per_phase` (0.4). Print each spec on a new line.
    3.  **Safety Warning:** Use a single `print()` command with triple quotes to display a multi-line "Safety Warning" for the CNC machine.

### **Lecture 2: Variables as Component Storage**
*   **Lecture Notes:**
    *   Variables are named memory locations. Rules: No spaces, must start with a letter.
    *   Standard Naming: Use `snake_case` (e.g., `resistor_value = 100`).
*   **Study Objective:** Store a Bill of Materials (BOM). You must store a Name (String), Price (Float), and Quantity (Int).
*   **Teacher's Hint:** Python is "Dynamic." You can change a variable from an Int to a String, but it’s bad practice for hardware logs!
*   **Additional Exercises:**
    1.  **Update Inventory:** Create a `screw_count` variable with a value of 50. On the next line, "use" 10 screws by re-assigning the variable to `screw_count - 10`. Print the final count.
    2.  **Data Types:** Create two variables: `version_number = 5` and `version_name = "5.0"`. Use the `type()` function to print the data type of each and observe the difference.
    3.  **Cost Calculation:** Using your BOM variables, calculate the `total_cost` by multiplying the Price and Quantity. Print the result in a user-friendly format, like "Total Cost: $XX.XX".

---

## 📘 MODULE 2: SYSTEM LOGIC & CONTROL
*“Machines must make decisions.”*

### **Lecture 3: Logic Gates in Code (Conditional Branching)**
*   **Lecture Notes:**
    *   Indentation is not optional in Python—it defines the scope.
    *   Operators: `==` (Compare), `!=` (Not equal), `>` (Threshold check).
*   **Study Objective:** Code a "Thermal Interlock." If input temp > 50°C, the script should print "RED ALERT." If < 20°C, print "WARMING UP."
*   **Teacher's Hint:** Always include an `else` statement to handle "nominal" conditions.

*   **Tools for this Module:**
    *   Python's built-in `time` module (`import time`).
*   **Additional Exercises:**
    1.  **Tolerance Checker:** Write a script that checks if a `part_tolerance` variable is within an acceptable range (e.g., greater than 0.05 AND less than 0.1). Print "PASS" or "FAIL".
    2.  **Countdown Timer:** Use a `for` loop and `time.sleep(1)` to create a launch countdown that prints numbers from 10 down to 1, then prints "LIFTOFF!".
    3.  **Warm-up Cycle:** Simulate a machine's warm-up. Use a `while` loop to increment a `current_temp` variable from 20 until it reaches a `target_temp` of 90, printing the temperature at each step.

### **Lecture 4: Repetitive Testing (Loops)**
*   **Lecture Notes:**
    *   `range(10)` creates a sequence from 0 to 9.
    *   Use `while True:` for infinite loops (like a machine monitor) but always have a `break` condition.
*   **Study Objective:** Simulate a "Batch Quality Check." Print a sequence of "Testing Component #X..." for 10 units.
*   **Teacher's Hint:** Use `time.sleep(1)` inside loops to prevent your processor from hitting 100% usage during hardware polling.
*   **Additional Exercises:**
    1.  **Find First Failure:** Create a list of quality scores `[99.5, 98.7, 99.1, 95.2, 99.8]`. Loop through the list and use an `if` statement to `break` the loop and print the score of the first part that is below 96.
    2.  **Skip Defective Parts:** Using the same list, use the `continue` keyword to skip any part with a score below 98 and only print the scores of the "good" parts.
    3.  **Infinite Monitor:** Write a `while True:` loop that prints "System OK" every 5 seconds. (You will need to manually stop this script with Ctrl+C).

---
*   **Tools for this Module:**
    *   Python's built-in `csv` module (`import csv`).
*   **Additional Exercises:**
    1.  **Unit Converter:** Write a function `mm_to_inches(mm)` that takes a millimeter value as an argument, converts it to inches (1mm = 0.0393701 inches), and `return`s the result.
    2.  **Log File Reader:** Create a `.txt` file with a list of error codes. Write a Python script to open the file, read each line, and print it to the console.
    3.  **Data Validator:** Build a function `is_valid(reading, min_val, max_val)` that checks if a sensor `reading` is between `min_val` and `max_val` and returns `True` or `False`.

### **Lecture 6: Handling Data Streams (Lists & Files)**
*   **Lecture Notes:**
    *   Lists are useful for time-series data. Append values as they come in from a sensor.
    *   File management: Always use the `with open(...) as f:` syntax. It ensures the file closes even if the code crashes.
*   **Study Objective:** Write sensor data into a `.csv` file format.
*   **Teacher's Hint:** Never calculate inside a file-write block. Process first, then save.
*   **Additional Exercises:**
    1.  **List Slicing:** Create a list of 100 simulated sensor readings. Use list slicing to get the first 10 readings and the last 10 readings.
    2.  **Append to Log:** Open a log file in append mode (`'a'`) and add a new "System Reboot" message with a timestamp.
    3.  **CSV Writer:** Create a list of lists, where each inner list is a row (e.g., `['Timestamp', 'Temperature', 'Pressure']`). Use the `csv` module to write this data to a new `.csv` fil
    *   Functions encapsulate logic. Key components: `def`, `arguments`, and `return`.
    *   Purpose: "Write once, test once, use everywhere."
*   **Study Objective:** Create a library of 3 formulas (e.g., Ohms Law, Watts Law, Kinetic Energy).
*   **Teacher's Hint:** If your function does more than one thing, split it. Keep it "Atomic."

### **Lecture 6: Handling Data Streams (Lists & Files)**
*   **Lecture Notes:**
    *   Lists are useful for time-series data. Append values as they come in from a sensor.
    *   File management: Always use the `with open(...) as f:` syntax. It ensures the file closes even if the code crashes.
*   **Study Objective:** Write sensor data into a `.csv` file format.
*   **Teacher's Hint:** Never calculate inside a file-write block. Process first, then save.

---

## 📘 MODULE 4: HARDWARE INTEGRATION
*“Bridging the Digital and Physical.”*

### **Lecture 7: The Serial Interface (pyserial)**
*   **Lecture Notes:**
    *   COM ports are the bridge. Baud rate (9600 vs 115200) must match on both sides.
    *   `ser.readline()` waits for a newline character `\n`.
*   **Study Objective:** Establish a handshake between Python and your Lab Machine.
*   **Teacher's Hint:** Most "failed" hardware projects are caused by mismatched baud rates or missing `decode('utf-8')`.

*   **Tools for this Module:**
    *   `pip install pyserial`
    *   `pip install matplotlib`
    *   An Arduino Uno or ESP32 board.
*   **Additional Exercises:**
    1.  **GUI Controller:** Create a simple text menu in Python that asks the user to type 'ON' or 'OFF'. Send the corresponding command over the serial port to the Arduino to control its built-in LED.
    2.  **Live Data Plot:** Modify the `matplotlib` script to run in a loop, clearing and re-plotting the graph every time a new piece of data arrives from the serial port.
    3.  **Error Logging:** Program the Arduino to sometimes send the message "ERROR: Sensor disconnected". Make your Python script listen for incoming messages and write any line containing "ERROR" to a separate `error_log.txt` file.

### **Lecture 8: Visual Analytics (Matplotlib)**
*   **Lecture Notes:**
    *   Engineers communicate through graphs, not spreadsheets.
    *   Use `plt.plot(x, y)` for time-series and `plt.show()` to render.
*   **Study Objective:** Plot your batches of data from Module 3 into a labeled graph.
*   **Teacher's Hint:** Always label your axes and include units (e.g., "Time (s)"). A graph without units is scientifically useless.
*   **Additional Exercises:**
    1.  **Multiple Plots:** Plot two sets of data (e.g., "Temperature" and "Pressure") on the same graph. Use different colors and add a legend to identify them.
    2.  **Save to File:** After generating a graph, use `plt.savefig('my_graph.png')` to save it as a high-quality image file for your reports.
    3.  **Subplots:** Create a figure with two separate graphs stacked vertically: one for Temperature and one for Humidity.

---

 📝 THE LAB ENGINEER'S SURVIVAL GUIDE (QUICK-REFERENCE NOTES)
*Print these pages and tape them to the Lab workbenches.*

1. Syntax Cheat-Sheet for Hardware Control**
*   **Variable Declaration:** `pin_id = 13` (Integer) | `state = True` (Boolean).
*   **Strings:** `message = "MOTOR_ON"` (Always use double quotes for hardware commands).
*   **Comments:** `# This is a vital note.` (Always comment your pin layouts!).

### **2. Troubleshooting Log (When things fail)**
*   **"AttributeError":** You are calling a tool the module doesn't have. (Check: `import serial` vs calling `serial.Serial`).
*   **"SyntaxError":** You likely missed a colon `:` at the end of an `if` or `for` statement.
*   **"IndentationError":** Python code *lives* in its spaces. 4 spaces = 1 block level.
*   **"TimeoutError":** Your Python script is speaking, but your hardware (Arduino) isn't listening (Check Baud Rate!).

### **3. Safe-Code Patterns (The "Reliability" Rules)**
*   **Rule A: The "Fail-Safe":** Always wrap sensor reads in `try...except`. If a sensor unplugs, your machine shouldn't catch fire; the code should just say "Sensor Missing."
*   **Rule B: The "Baud Rate" Law:** Always initialize your serial ports at `9600` for stability or `115200` for speed. Never assume.
*   **Rule C: The "Newline" Hook:** Most industrial machines wait for a `\n` (newline) before they execute a command. Always add it: `ser.write(b"START\n")`.

### **4. Python Library Master-List (What to install)**
*   `pip install pyserial` -> To talk to USB hardware.
*   `pip install pandas` -> To handle huge spreadsheets of lab data.
*   `pip install matplotlib` -> To make the "Hero Graphs" for your reports.
*   `pip install opencv-python` -> For any project using a camera/vision.

### **5. Instructor's Final Word on Lab Culture**
"In this lab, code is a tool, not a math problem. If it controls the motor correctly and safely, it's good code. If it crashes the machine during a test, it's a 'Learning Event.' Document your failures—they make for the best Engineering logs."

---

## 🎯 MODULE-BY-MODULE QUIZ (SELF-TEST)
*A student should skip to the next Module only if they can answer these:*

**Q1 (Module 1):** Why do we use `float(3.5)` instead of `int(3.5)` for measuring resistor tolerance?
**Q2 (Module 2):** In a `while True:` loop, what happens if you forget a `time.sleep()`?
**Q3 (Module 3):** What is the difference between writing a file in mode `'w'` vs mode `'a'`?
**Q4 (Module 4):** Why do we have to `.decode('utf-8')` data coming from an Arduino?

---

## 🎓 FINAL RESEARCH PROJECT: THE INTEGRATED LAB MONITOR
**Assignment:**
1.  Read a simulated or live sensor stream.
2.  Log every 10th reading to a persistent file.
3.  If a value exceeds a safety threshold, trigger a visual alert.
4.  Generate a summary graph at the end of the run.

**Grading Criteria:**
*   Code Readability (Comments & Naming)
*   Stability (Error handling for file/sensor faults)
*   Data Accuracy (Units & Precision)
