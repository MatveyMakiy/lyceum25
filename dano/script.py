import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats
from sklearn.linear_model import LinearRegression

# 1️⃣ ЗАГРУЗКА ДАННЫХ (DATA LOADING)
# Загрузите ваш CSV-файл (например, data.csv)
# Поместите файл в ту же папку, где лежит этот скрипт
df = pd.read_csv("data.csv")

print("🔍 Первые строки данных:")
print(df.head())
print("\n📋 Информация о данных:")
print(df.info())

# ОЧИСТКА ДАННЫХ (DATA CLEANING)
# Проверим пропуски и дубликаты
print("\nПропуски по столбцам:")
print(df.isna().sum())

df = df.drop_duplicates()  # удалим дубликаты
df = df.fillna(df.median(numeric_only=True))  # заполним пропуски медианой

# Удаление выбросов (по правилу 3 сигм)
for col in df.select_dtypes(include=np.number):
    df = df[(np.abs(stats.zscore(df[col])) < 3)]

print("\n✅ После очистки данных:", df.shape)

# ОПИСАТЕЛЬНАЯ СТАТИСТИКА (DESCRIPTIVE STATISTICS)
print("\n📊 Описательная статистика:")
print(df.describe())

print("\n🔗 Корреляции:")
print(df.corr(numeric_only=True))


# ВИЗУАЛИЗАЦИЯ (VISUALIZATION)
# Pairplot — диаграммы рассеяния между всеми переменными
sns.pairplot(df)
plt.suptitle("Диаграммы рассеяния (Scatter plots)", y=1.02)
plt.show()

# Тепловая карта корреляций (Heatmap)
sns.heatmap(df.corr(numeric_only=True), annot=True, cmap='coolwarm')
plt.title("Корреляционная матрица")
plt.show()

# Пример гистограммы и boxplot
for col in df.select_dtypes(include=np.number):
    plt.figure()
    sns.histplot(df[col], kde=True)
    plt.title(f"Гистограмма переменной {col}")
    plt.show()

    sns.boxplot(x=df[col])
    plt.title(f"Boxplot переменной {col}")
    plt.show()

# линейнай регрессия
# Укажи свои имена столбцов
# Пример: X = df[['x']], y = df['y']
# Замени 'x_column' и 'y_column' на реальные названия столбцов

if 'x_column' in df.columns and 'y_column' in df.columns:
    X = df[['x_column']]
    y = df['y_column']
    model = LinearRegression()
    model.fit(X, y)

    print("\n📈 Линейная регрессия:")
    print(f"Коэффициент (slope): {model.coef_[0]}")
    print(f"Свободный член (intercept): {model.intercept_}")
    print(f"R^2: {model.score(X, y)}")

# ПРОВЕРКА ГИПОТЕЗ (HYPOTHESIS TESTING)
# Пример: t-тест для сравнения двух групп
# Замени 'group' и 'value' на реальные столбцы

if 'group' in df.columns and 'value' in df.columns:
    group1 = df[df['group'] == 'A']['value']
    group2 = df[df['group'] == 'B']['value']
    t_stat, p_val = stats.ttest_ind(group1, group2)
    print("\n🔬 Проверка гипотезы (t-тест):")
    print(f"t = {t_stat:.3f}, p = {p_val:.4f}")


# СОХРАНЕНИЕ РЕЗУЛЬТАТОВ

df.to_csv("cleaned_data.csv", index=False)
print("\n💾 Очищенные данные сохранены в cleaned_data.csv")

# df.head() — первые строки
# df.describe() — базовая статистика
# df['col'].mean(), df['col'].median() — среднее, медиана
# df.corr() — корреляции
# sns.heatmap() — тепловая карта
# stats.ttest_ind() — t-тест
# LinearRegression() — линейная регрессия
