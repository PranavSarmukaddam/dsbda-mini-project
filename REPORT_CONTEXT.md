# CardioScan Insights: Comprehensive Project Report

## 1. Abstract
CardioScan Insights is an interactive Data Science and Big Data Analysis (DSBDA) web application designed to analyze, visualize, and predict heart disease risks based on clinical datasets. Built entirely using modern web technologies (React.js, Vite, Recharts), the application bridges the gap between raw data analysis and practical clinical software. It ingests patient records, dynamically aggregates metrics across demographic and physiological dimensions, and utilizes a heuristic-based expert system to simulate predictive risk scoring—all executed seamlessly on the client side without relying on complex backend infrastructure.

---

## 2. Introduction

### 2.1 Background
Cardiovascular diseases (CVDs) are the leading cause of death globally. Early detection and continuous monitoring of risk factors such as blood pressure, cholesterol, and maximum heart rate are critical in preventing severe cardiac events. The explosion of health data has created a massive demand for data science tools that can transform thousands of raw clinical records into actionable, visual insights for healthcare providers.

### 2.2 Problem Statement
Clinical data is often stored in dense, unreadable formats (like CSVs or SQL databases). Healthcare professionals need intuitive, visual dashboards to understand demographic trends (e.g., how age correlates with disease) and assess individual patient risk. Many existing dashboards are either static (requiring manual data re-pulls) or require heavy backend processing, leading to high latency.

### 2.3 Objectives
- To develop a dynamic, highly responsive web dashboard for exploring cardiovascular data.
- To implement client-side data parsing to instantly process hundreds of patient records in the browser.
- To visualize complex relationships between risk factors (chest pain, blood sugar) and positive heart disease diagnoses using interactive charts.
- To build a predictive clinical tool (Risk Calculator) that assigns a risk probability based on user input, leveraging a heuristic rule engine.

### 2.4 Scope
The project encompasses the frontend development of the dashboard, local data processing algorithms, UI/UX design, interactive charting, and continuous deployment via Vercel. It focuses on the exploratory data analysis (EDA) and predictive simulation of heart disease risk factors.

---

## 3. System Architecture & Tech Stack

### 3.1 Technology Stack
The application is built on a highly optimized, modern JavaScript stack:
- **Core Framework**: React.js (v18) - Chosen for its component-based architecture and efficient virtual DOM updates.
- **Build Tool**: Vite - Utilized for instantaneous Hot Module Replacement (HMR) during development and highly optimized rollup bundling for production.
- **Data Visualization Library**: Recharts - Selected for its declarative, composable React components that render SVG-based charts, ensuring perfect scalability across devices.
- **Data Parsing Engine**: PapaParse - The fastest in-browser CSV parser, allowing the application to ingest raw datasets locally without a backend server.
- **Styling**: Vanilla CSS - Utilizing Flexbox and CSS Grid for a custom, medical-themed layout without the bloat of heavy UI frameworks.
- **Hosting & CI/CD**: Vercel - Provides serverless deployment tightly integrated with GitHub for continuous integration.

### 3.2 Data Flow Architecture
Unlike traditional MVC applications, CardioScan relies entirely on **Client-Side Processing Architectures**:
1. **Ingestion**: Upon loading the application, `PapaParse` asynchronously fetches the static `heart_disease.csv` file from the public directory.
2. **State Initialization**: The parsed JSON array is loaded into the React `useState` hook (`data`).
3. **Filtering & Aggregation**: A reactive `useMemo` hook listens for changes in global filters (Age, Gender). When triggered, it filters the dataset and calculates all aggregate metrics (averages, counts, demographic splits) in memory.
4. **Rendering**: The processed aggregations are passed down to the Recharts components and UI stat cards to render the visual dashboard.

---

## 4. Dataset Description

The application processes a dataset of 500 patient records. To ensure data privacy while maintaining robust statistical distributions for visualization, this data was synthetically generated to mirror the renowned **UCI Machine Learning Repository Heart Disease Dataset** (specifically the Cleveland database).

### 4.1 Feature Breakdown (Variables)
- `age`: Continuous. The patient's age in years (Range: ~29 to 77).
- `sex`: Binary. Biological sex where `1 = Male` and `0 = Female`.
- `cp`: Categorical. Chest Pain Type.
  - 1: Typical Angina
  - 2: Atypical Angina
  - 3: Non-anginal Pain
  - 4: Asymptomatic (Often the highest risk indicator).
- `trestbps`: Continuous. Resting blood pressure on admission to the hospital (in mm Hg).
- `chol`: Continuous. Serum cholesterol in mg/dl.
- `fbs`: Binary. Fasting blood sugar. Indicates if the patient's blood sugar is > 120 mg/dl (`1 = True`, `0 = False`).
- `thalach`: Continuous. Maximum heart rate achieved during a stress test.
- `target`: Binary. The definitive diagnosis. `1` indicates the presence of heart disease, `0` indicates absence.

### 4.2 Derived Features
During the data processing phase, the application dynamically generates several derived features to aid in visualization:
- `age_group`: Buckets continuous age into categorical bins (`<45`, `45-55`, `56-65`, `>65`).
- `cp_label`: Maps the integer codes to human-readable chest pain strings.
- `sex_label`: Maps boolean sex to Male/Female strings.

---

## 5. Modules & Application Features

The dashboard is divided into five primary interactive modules (tabs), each serving a specific analytical purpose.

### 5.1 Global Data Filtering Engine
At the top of the interface, the application features global state filters. Users can slice the entire dashboard dynamically by selecting specific Genders or Age Brackets. This utilizes React's context/state updates to trigger an immediate re-render of all charts, demonstrating advanced, zero-latency data manipulation.

### 5.2 Module 1: Clinical Overview
This module acts as the executive summary of the dataset.
- **Statistical KPIs**: Displays vital aggregate metrics including Total Patients analyzed, overall Prevalence Rate (%), Average Age, Average Cholesterol, and Average Blood Pressure.
- **Population Health Chart**: A central donut (Pie) chart that visualizes the overarching ratio of Healthy individuals versus those diagnosed with Heart Disease.

### 5.3 Module 2: Demographic Analysis
This module breaks down how the disease manifests across different population segments.
- **Age Group Distribution**: A grouped bar chart comparing Healthy vs. Heart Disease counts across four distinct age brackets. It visually demonstrates how cardiovascular risk scales exponentially with age.
- **Gender Breakdown**: A Pie Chart that visualizes the distribution of the disease separated by biological sex, highlighting any gender-based predispositions present in the dataset.

### 5.4 Module 3: Clinical Risk Factors
This module delves into specific physiological symptoms and metabolic indicators.
- **Chest Pain Impact**: A horizontal bar chart that maps the volume of diagnoses against the type of chest pain experienced. It clearly visualizes the clinical phenomenon where "Asymptomatic" chest pain is a massive indicator of severe cardiac events.
- **Blood Sugar Analysis**: A grouped bar chart that evaluates the impact of elevated Fasting Blood Sugar (>120 mg/dl) on the likelihood of a positive diagnosis.

### 5.5 Module 4: Raw Data Explorer
Data transparency is critical in DSBDA. This module features a scrollable, stylized HTML data table that allows end-users to inspect the first 50 rows of the raw, underlying CSV records exactly as they were parsed by the engine.

### 5.6 Module 5: Predictive Risk Calculator
This is the most advanced, interactive module. It provides a functional clinical form where a user can input hypothetical or real patient metrics (Age, Sex, BP, Cholesterol, Max Heart Rate, Chest Pain Type). Upon submission, it generates a "Simulated Heart Disease Risk Probability" score, complete with color-coded severity warnings.

---

## 6. Algorithmic Predictive Model: The Expert System

### 6.1 Rationale: Why Not Machine Learning?
In many frontend-heavy data science projects, developers attempt to load heavy Machine Learning models (like a pickled Random Forest via a Flask/Python API). This introduces massive network latency, requires complex backend hosting, and results in a "Black Box" model where the clinical reasoning is hidden from the doctor.

Instead, CardioScan Insights implements a **Heuristic-Based Rule Engine (Expert System)** entirely in JavaScript. This ensures instantaneous local calculation, 100% explainability, and perfect alignment with medical scoring systems (like the Framingham Risk Score).

### 6.2 The Algorithmic Logic
The algorithm acts as a weighted penalty system. It begins with a base risk probability of 5% and evaluates the input features sequentially, adding weighted risk percentages based on established clinical danger thresholds:

1. **Age Factor**:
   - `If Age > 50: Risk += 15%`
   - `If Age > 60: Risk += an additional 10%`
2. **Sex Factor**:
   - `If Male (1): Risk += 10%`
3. **Chest Pain Factor** (Highest Weighting):
   - `If Typical Angina (1): Risk += 15%`
   - `If Asymptomatic (4): Risk += 30%` (Asymptomatic ischemia is highly dangerous).
4. **Blood Pressure Factor**:
   - `If Resting BP > 130: Risk += 10%`
   - `If Resting BP > 140: Risk += an additional 10%`
5. **Cholesterol Factor**:
   - `If Serum Chol > 200: Risk += 10%`
   - `If Serum Chol > 240: Risk += an additional 10%`
6. **Heart Rate Factor** (Inverse Relationship):
   - `If Max Heart Rate < 140: Risk += 15%`
   - `If Max Heart Rate < 120: Risk += an additional 10%`

The final calculated score is computationally bounded (`Math.min(score, 95)`) to ensure the probability remains within a realistic 5% to 95% range.

---

## 7. Performance & Optimization Strategy

1. **Memoization (`useMemo`)**: The application uses React's `useMemo` hook to cache the result of the data filtering and aggregation loops (`O(N)` complexity). The heavy math required to calculate averages and bucket the data for Recharts only runs when the underlying `data` array or global filters change, preventing unnecessary recalculations on generic state updates.
2. **Client-Side Parsing**: By downloading the CSV once and using PapaParse locally, the application eliminates all API latency. Slicing and filtering data locally in the browser is exponentially faster than querying a remote SQL database for a dataset of this size.

---

## 8. Deployment & CI/CD

The project utilizes a continuous deployment pipeline via **Vercel**. 
1. The source code is maintained in a GitHub repository.
2. Vercel is hooked directly into the `main` branch via webhooks.
3. Upon any code push (such as implementing the Risk Calculator), Vercel automatically spins up an isolated build container, runs the Vite production build script (`npm run build`), minifies the JavaScript assets, and deploys the optimized static bundle to a globally distributed Edge Network (CDN).

---

## 9. Conclusion & Future Scope

### 9.1 Conclusion
CardioScan Insights successfully fulfills the requirements of a comprehensive DSBDA project. It demonstrates the ability to ingest raw clinical data, apply data wrangling techniques locally, construct a suite of interactive visualizations, and implement an explainable algorithmic risk model. The result is a highly performant, visually appealing, and genuinely useful clinical dashboard.

### 9.2 Future Enhancements
- **Backend ML Integration**: While the heuristic model is effective, future iterations could integrate a FastAPI backend serving a scikit-learn XGBoost model for true machine learning inference.
- **Larger Datasets**: Transitioning from a static CSV to a dynamic SQL/NoSQL database (like PostgreSQL or Firebase) to handle millions of rows.
- **Export Capabilities**: Adding PDF report generation functionality so clinicians can print out a patient's personalized risk assessment.
