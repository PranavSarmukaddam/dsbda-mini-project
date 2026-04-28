import pandas as pd
import numpy as np

np.random.seed(42)
n_samples = 500

# Generate features based on typical UCI dataset distributions
age = np.random.normal(loc=54, scale=9, size=n_samples).astype(int)
age = np.clip(age, 29, 77)

sex = np.random.choice([0, 1], size=n_samples, p=[0.32, 0.68]) # 1: Male, 0: Female

# cp: chest pain type (1: typical angina, 2: atypical angina, 3: non-anginal pain, 4: asymptomatic)
cp = np.random.choice([1, 2, 3, 4], size=n_samples, p=[0.08, 0.16, 0.28, 0.48])

# trestbps: resting blood pressure
trestbps = np.random.normal(loc=131, scale=17, size=n_samples).astype(int)
trestbps = np.clip(trestbps, 94, 200)

# chol: serum cholestoral in mg/dl
chol = np.random.normal(loc=246, scale=51, size=n_samples).astype(int)
chol = np.clip(chol, 126, 564)

# fbs: fasting blood sugar > 120 mg/dl (1 = true; 0 = false)
fbs = np.random.choice([0, 1], size=n_samples, p=[0.85, 0.15])

# thalach: maximum heart rate achieved
thalach = np.random.normal(loc=149, scale=22, size=n_samples).astype(int)
thalach = np.clip(thalach, 71, 202)

# Calculate risk score to reasonably correlate features with target
risk_score = (age / 77) * 0.2 + (sex) * 0.1 + (cp == 4) * 0.2 + \
             (trestbps / 200) * 0.1 + (chol / 564) * 0.1 + \
             (1 - thalach / 202) * 0.2 + np.random.normal(0, 0.1, n_samples)

# target: diagnosis of heart disease (1: presence, 0: absence)
# Let's target roughly ~45% prevalence
target = (risk_score > np.percentile(risk_score, 55)).astype(int)

df = pd.DataFrame({
    'age': age,
    'sex': sex,
    'cp': cp,
    'trestbps': trestbps,
    'chol': chol,
    'fbs': fbs,
    'thalach': thalach,
    'target': target
})

# Add meaningful string labels for easier parsing in React
df['sex_label'] = df['sex'].map({1: 'Male', 0: 'Female'})
df['cp_label'] = df['cp'].map({1: 'Typical Angina', 2: 'Atypical Angina', 3: 'Non-anginal Pain', 4: 'Asymptomatic'})
df['target_label'] = df['target'].map({1: 'Heart Disease', 0: 'Healthy'})
df['age_group'] = pd.cut(df['age'], bins=[0, 45, 55, 65, 100], labels=['<45', '45-55', '56-65', '>65'])

df.to_csv("g:/DSBDA MINI PROJECT/public/heart_disease.csv", index=False)
df.to_csv("g:/DSBDA MINI PROJECT/heart_disease.csv", index=False)
print("Synthetic dataset generated and saved successfully!")
