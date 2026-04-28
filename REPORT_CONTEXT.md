# CardioScan Insights: Data Science & Big Data Analysis Mini-Project Report Context

## 1. Project Overview & Objective
**CardioScan Insights** is a comprehensive, interactive data science web application designed to analyze, visualize, and extract predictive insights from a clinical dataset regarding heart disease. 

The primary objective of this mini-project is to demonstrate proficiency in handling medical datasets, building interactive data visualization dashboards, managing complex application state, and implementing algorithmic risk assessment logic within a modern web framework. It bridges the gap between raw data analysis and end-user clinical software by providing an intuitive interface for exploring patient records and understanding demographic and physiological risk factors associated with cardiovascular diseases.

## 2. Technology Stack & Architecture
The project was built using a modern JavaScript stack tailored for performance and high-quality data visualization:
- **Frontend Framework**: React.js (v18)
- **Build Tool**: Vite (for rapid development and optimized production bundling)
- **Data Visualization**: Recharts (A composable charting library built on React components)
- **Data Parsing**: PapaParse (For fast, in-browser parsing of the clinical CSV dataset)
- **Styling**: Pure CSS with CSS Grid/Flexbox for a responsive, medical-themed UI layout.
- **Deployment**: Vercel (CI/CD pipeline directly connected to GitHub).

### Architecture Highlights
- **Client-Side Processing**: Instead of relying on a complex backend, the application loads the dataset and processes it entirely in the browser using advanced React hooks.
- **Performance Optimization**: The `useMemo` hook is heavily utilized to cache expensive data filtering and aggregation calculations. The dashboard only recalculates chart data when the raw data or global filters change, ensuring a smooth 60fps experience even when interacting with the UI.

## 3. The Dataset
The project utilizes a dataset inspired by the famous **UCI Machine Learning Repository Heart Disease Dataset**. To ensure robust data distribution across all features for the visualization, a highly realistic synthetic dataset of 500 patient records was generated matching the statistical distribution of the original Cleveland database.

### Key Attributes (Features)
1. **Age**: Patient's age in years.
2. **Sex**: Biological sex (Male/Female).
3. **Chest Pain Type (cp)**: Categorized into Typical Angina, Atypical Angina, Non-anginal Pain, and Asymptomatic.
4. **Resting Blood Pressure (trestbps)**: Measurement in mmHg upon admission.
5. **Serum Cholesterol (chol)**: Measurement in mg/dl.
6. **Fasting Blood Sugar (fbs)**: A boolean indicator if fasting blood sugar > 120 mg/dl.
7. **Maximum Heart Rate Achieved (thalach)**: Maximum heart rate recorded during a stress test.
8. **Target (Diagnosis)**: The definitive label indicating the presence (Heart Disease) or absence (Healthy) of cardiovascular disease.

## 4. Core Features & Functionalities

### A. Global Data Filtering Engine
The dashboard implements a top-level filtering system that allows users to slice the entire dataset dynamically. By selecting specific Genders (Male/Female) or Age Brackets (<45, 45-55, etc.), the React state updates, triggering the `useMemo` hook to recalculate all aggregated metrics, pie charts, and bar charts in real-time. This proves the application is not static, but a true interactive data exploration tool.

### B. Clinical Overview Tab
Provides a high-level summary of the dataset or the filtered subset:
- **KPI Metrics**: Displays Total Patients, Prevalence Rate, Average Age, Average Cholesterol, and Average Blood Pressure.
- **Overall Population Health Status**: A prominent Pie Chart summarizing the ratio of Healthy individuals vs. those with Heart Disease.

### C. Demographic Analysis Tab
Focuses on the distribution of the disease across populations:
- **Health Status by Age Group**: A grouped Bar Chart showing how heart disease prevalence scales across age brackets.
- **Health Status by Gender**: A Pie Chart visualizing the split of healthy vs. diseased individuals filtered by biological sex.

### D. Clinical Risk Factors Tab
Analyzes how specific physiological symptoms correlate with a positive diagnosis:
- **Chest Pain Impact**: A horizontal Bar Chart demonstrating the volume of patients exhibiting each type of chest pain, starkly highlighting that 'Asymptomatic' chest pain often correlates heavily with actual heart disease in clinical data.
- **Fasting Blood Sugar**: Evaluates the impact of elevated blood sugar as a metabolic risk factor.

### E. Raw Data Explorer Tab
A scrollable, paginated HTML table that allows the user or evaluator to inspect the raw CSV records being parsed by the application. This ensures data transparency and verifies that the visualizations are grounded in actual data rows.

## 5. Predictive Risk Calculator (Algorithmic Logic)
One of the most advanced features of the project is the **Predictive Risk Calculator**. 

### How it Works
Rather than requiring the user to deploy a complex Python backend with a serialized Machine Learning model (like a pickled Random Forest or Logistic Regression model), the application implements a **Heuristic-Based Rule Engine** (an Expert System algorithm).

When the user inputs clinical metrics into the form, the algorithm executes the following weight-based heuristic calculation:
1. **Base Risk**: Starts at an arbitrary 5% probability.
2. **Age Penalty**: Being over 50 adds 15%; over 60 adds an additional 10%.
3. **Sex Penalty**: Male patients receive a +10% risk adjustment based on general dataset prevalence.
4. **Chest Pain (The strongest indicator)**: Typical Angina adds 15%, but 'Asymptomatic' (often indicative of silent ischemia) adds a massive 30% penalty.
5. **Blood Pressure & Cholesterol**: Elevated levels cross specific thresholds (>130, >140 for BP; >200, >240 for Chol) to sequentially add 10% penalties.
6. **Heart Rate**: Failure to achieve a high maximum heart rate during stress (<140, <120) adds significant risk penalties.

The final score is capped between 5% and 95%. It is then color-coded (Green for Low Risk, Yellow for Moderate Risk, Red for High Risk) and rendered dynamically on the screen.

### Why this approach was chosen for the Mini-Project:
- **Performance**: It runs entirely locally on the client-side without API latency.
- **Explainability**: Unlike a "black box" Neural Network, a rule-based algorithm is 100% explainable, which is often highly desirable in medical software systems.
- **Scope**: It perfectly simulates the *output* of a predictive model for UI/UX demonstration purposes without the overhead of maintaining a Python backend on a platform like Heroku or Render.

## 6. Conclusion
CardioScan Insights successfully processes raw medical data, aggregates it efficiently, and visualizes complex relationships through an intuitive UI. By blending exploratory data analysis (EDA) techniques with interactive web development and rule-based prediction algorithms, it stands as a complete, end-to-end Data Science dashboard.
