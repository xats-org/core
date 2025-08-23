/**
 * Real-world example tests for R Markdown renderer
 */

import { describe, it, expect, beforeEach } from 'vitest';

import { RMarkdownRenderer, ACADEMIC_WORKFLOW_CONFIGS } from '../index.js';

describe('Real-world R Markdown Examples', () => {
  let renderer: RMarkdownRenderer;

  beforeEach(() => {
    renderer = new RMarkdownRenderer();
  });

  describe('Statistical Analysis Paper', () => {
    const statisticalPaper = `---
title: "Effects of Exercise on Heart Rate: A Statistical Analysis"
author: 
  - name: "Dr. Sarah Chen"
    affiliation: "Department of Statistics, University of Science"
    email: "s.chen@university.edu"
  - name: "Prof. Michael Johnson"
    affiliation: "Department of Exercise Science, University of Science" 
date: "2024-01-15"
output: 
  bookdown::pdf_document2:
    toc: true
    number_sections: true
    fig_caption: true
bibliography: references.bib
csl: apa-style.csl
---

# Abstract

This study examines the relationship between different types of exercise and heart rate response in healthy adults. We collected data from 100 participants and used statistical modeling to analyze the effects.

# Introduction

Physical exercise has long been known to affect cardiovascular health [@smith2020exercise]. This study aims to quantify these effects using modern statistical methods.

# Methods {#sec:methods}

## Data Collection

We recruited participants through university announcements. Each participant completed three different exercise protocols:

1. Low-intensity walking (3 mph)
2. Moderate cycling (15 mph)  
3. High-intensity running (7 mph)

## Statistical Analysis

All analyses were conducted in R version 4.3.0 [@rcoreteam2023].

\`\`\`{r setup, include=FALSE}
knitr::opts_chunk$set(
  echo = TRUE,
  warning = FALSE, 
  message = FALSE,
  fig.width = 8,
  fig.height = 6
)

# Load required packages
library(tidyverse)
library(ggplot2) 
library(lme4)
library(broom.mixed)
library(kableExtra)
\`\`\`

\`\`\`{r load-data}
# Load and prepare data
data <- read_csv("heart_rate_data.csv")

# Data cleaning
clean_data <- data %>%
  filter(!is.na(heart_rate), 
         heart_rate > 60, 
         heart_rate < 200) %>%
  mutate(
    exercise_type = factor(exercise_type, 
                          levels = c("walking", "cycling", "running")),
    age_group = cut(age, breaks = c(0, 30, 50, 70, 100), 
                   labels = c("18-30", "31-50", "51-70", "70+"))
  )

# Summary statistics
summary_stats <- clean_data %>%
  group_by(exercise_type) %>%
  summarise(
    n = n(),
    mean_hr = mean(heart_rate),
    sd_hr = sd(heart_rate),
    median_hr = median(heart_rate),
    .groups = "drop"
  )
\`\`\`

Table \\@ref(tab:summary-stats) shows the descriptive statistics for heart rate by exercise type.

\`\`\`{r summary-stats}
kable(summary_stats, 
      caption = "Descriptive statistics for heart rate by exercise type",
      col.names = c("Exercise Type", "N", "Mean HR", "SD HR", "Median HR"),
      digits = 2) %>%
  kable_styling(bootstrap_options = c("striped", "hover"))
\`\`\`

# Results

## Exploratory Data Analysis

Figure \\@ref(fig:boxplot) shows the distribution of heart rate by exercise type.

\`\`\`{r boxplot, fig.cap="Heart rate distribution by exercise type"}
ggplot(clean_data, aes(x = exercise_type, y = heart_rate, fill = exercise_type)) +
  geom_boxplot(alpha = 0.7) +
  geom_jitter(width = 0.2, alpha = 0.5) +
  scale_fill_viridis_d() +
  labs(
    x = "Exercise Type",
    y = "Heart Rate (bpm)",
    fill = "Exercise Type"
  ) +
  theme_minimal() +
  theme(legend.position = "none")
\`\`\`

## Statistical Modeling

We fitted a mixed-effects model to account for repeated measures within participants:

\`\`\`{r mixed-model}
# Fit mixed-effects model
model <- lmer(heart_rate ~ exercise_type + age + (1|participant_id), 
              data = clean_data)

# Model summary
tidy_model <- tidy(model, effects = "fixed")
print(tidy_model)
\`\`\`

The model results show significant differences between exercise types (p < 0.001).

## Effect Sizes

\`\`\`{r effect-sizes}
# Calculate pairwise comparisons
library(emmeans)
emm <- emmeans(model, ~ exercise_type)
pairs_result <- pairs(emm, adjust = "tukey")

# Convert to dataframe for nice display
pairs_df <- as.data.frame(pairs_result)
\`\`\`

Table \\@ref(tab:pairwise) shows the pairwise comparisons between exercise types.

\`\`\`{r pairwise}
kable(pairs_df, 
      caption = "Pairwise comparisons of heart rate by exercise type",
      digits = 3) %>%
  kable_styling()
\`\`\`

# Discussion

Our results demonstrate that exercise type has a significant effect on heart rate response. As expected, running produced the highest heart rates (mean = \`r round(filter(summary_stats, exercise_type == "running")$mean_hr, 1)\` bpm), followed by cycling and walking.

These findings are consistent with previous research [@jones2019cardio; @williams2021exercise] and support the use of heart rate as a measure of exercise intensity.

## Limitations

Several limitations should be noted:

1. The study was conducted in a controlled laboratory setting
2. Participants were relatively young and healthy
3. Exercise durations were standardized but may not reflect real-world conditions

# Conclusions

This study provides statistical evidence for the differential effects of exercise type on heart rate response. The results have implications for exercise prescription and cardiovascular health monitoring.

Future research should examine:
- Longer-term adaptations to different exercise types
- Effects in clinical populations  
- Integration with wearable device data

# References

::: {#refs}
:::

# Appendix {#sec:appendix}

## Additional Analyses

\`\`\`{r additional-viz, fig.cap="Heart rate by age group and exercise type"}
ggplot(clean_data, aes(x = age_group, y = heart_rate, fill = exercise_type)) +
  geom_boxplot() +
  facet_wrap(~exercise_type) +
  scale_fill_viridis_d() +
  labs(
    x = "Age Group", 
    y = "Heart Rate (bpm)",
    fill = "Exercise Type"
  ) +
  theme_minimal()
\`\`\`

## Session Information

\`\`\`{r session-info}
sessionInfo()
\`\`\`
`;

    it('should parse complex statistical paper', async () => {
      const result = await renderer.parse(statisticalPaper);

      expect(result.document.bibliographicEntry.title).toBe(
        'Effects of Exercise on Heart Rate: A Statistical Analysis'
      );
      expect(result.document.bibliographicEntry.author).toHaveLength(2);
      expect(result.metadata?.codeChunks).toHaveLength(7);
      expect(result.metadata?.crossReferences).toHaveLength(4);
    });

    it('should maintain code chunk options in round-trip', async () => {
      const parseResult = await renderer.parse(statisticalPaper);
      const roundTripResult = await renderer.testRoundTrip(parseResult.document);

      expect(roundTripResult.success).toBe(true);
      expect(roundTripResult.fidelityScore).toBeGreaterThan(0.8);
    });

    it('should render with academic paper configuration', async () => {
      const parseResult = await renderer.parse(statisticalPaper);
      const renderResult = await renderer.render(
        parseResult.document,
        ACADEMIC_WORKFLOW_CONFIGS.ACADEMIC_PAPER
      );

      expect(renderResult.content).toContain('bookdown::pdf_book');
      expect(renderResult.content).toContain('echo=FALSE');
    });
  });

  describe('Data Science Report', () => {
    const dataScienceReport = `---
title: "Customer Churn Analysis: Machine Learning Approach"  
author: "Data Science Team"
date: "\`r Sys.Date()\`"
output:
  html_document:
    toc: true
    toc_float: true
    code_folding: hide
    theme: flatly
params:
  data_path: "data/customer_data.csv"
  model_type: "random_forest"
---

# Executive Summary

This report analyzes customer churn patterns using machine learning techniques. We achieved \`r params$model_type\` accuracy of 87% in predicting customer churn.

# Data Preparation

\`\`\`{r setup, include=FALSE}
# Setup
knitr::opts_chunk$set(
  echo = TRUE,
  warning = FALSE,
  message = FALSE,
  cache = TRUE
)

library(tidyverse)
library(randomForest)
library(caret)
library(plotly)
library(DT)
\`\`\`

\`\`\`{r data-loading}
# Load data
data_path <- params$data_path
customer_data <- read_csv(data_path)

# Data overview
glimpse(customer_data)
\`\`\`

## Data Quality Assessment

\`\`\`{r data-quality}
# Check for missing values
missing_summary <- customer_data %>%
  summarise_all(~sum(is.na(.))) %>%
  gather(variable, missing_count) %>%
  filter(missing_count > 0) %>%
  arrange(desc(missing_count))

if(nrow(missing_summary) > 0) {
  kable(missing_summary, caption = "Missing value summary")
} else {
  cat("No missing values detected.")
}
\`\`\`

# Exploratory Data Analysis

\`\`\`{r churn-distribution, fig.cap="Distribution of customer churn"}
churn_plot <- customer_data %>%
  count(churn) %>%
  mutate(
    percentage = n / sum(n) * 100,
    churn = ifelse(churn == 1, "Churned", "Retained")
  ) %>%
  ggplot(aes(x = churn, y = n, fill = churn)) +
  geom_col() +
  geom_text(aes(label = paste0(round(percentage, 1), "%")), 
            vjust = -0.5) +
  scale_fill_manual(values = c("Churned" = "#e74c3c", "Retained" = "#2ecc71")) +
  labs(
    title = "Customer Churn Distribution",
    x = "Customer Status",
    y = "Number of Customers",
    fill = "Status"
  ) +
  theme_minimal()

ggplotly(churn_plot)
\`\`\`

## Feature Analysis

\`\`\`{r feature-correlation, fig.cap="Feature correlation with churn"}
# Calculate correlation with churn
numeric_vars <- customer_data %>%
  select_if(is.numeric) %>%
  select(-customer_id) %>%
  names()

correlations <- map_dfr(numeric_vars, ~{
  cor_val <- cor(customer_data[[.x]], customer_data$churn, use = "complete.obs")
  tibble(variable = .x, correlation = cor_val)
}) %>%
  arrange(desc(abs(correlation)))

ggplot(correlations, aes(x = reorder(variable, abs(correlation)), y = correlation)) +
  geom_col(aes(fill = correlation > 0)) +
  coord_flip() +
  scale_fill_manual(values = c("TRUE" = "#e74c3c", "FALSE" = "#3498db")) +
  labs(
    title = "Feature Correlation with Churn",
    x = "Variables",
    y = "Correlation Coefficient",
    fill = "Positive Correlation"
  ) +
  theme_minimal()
\`\`\`

# Machine Learning Model

\`\`\`{r model-training}
# Prepare data for modeling
model_data <- customer_data %>%
  select(-customer_id) %>%
  mutate(churn = factor(churn, labels = c("No", "Yes")))

# Train/test split
set.seed(42)
train_index <- createDataPartition(model_data$churn, p = 0.8, list = FALSE)
train_data <- model_data[train_index, ]
test_data <- model_data[-train_index, ]

# Train random forest model
if(params$model_type == "random_forest") {
  rf_model <- randomForest(
    churn ~ ., 
    data = train_data,
    ntree = 500,
    importance = TRUE
  )
  
  model <- rf_model
} else {
  # Alternative model types could go here
  model <- rf_model
}

# Model summary
print(model)
\`\`\`

## Model Performance

\`\`\`{r model-evaluation}
# Predictions on test set
predictions <- predict(model, test_data)
conf_matrix <- confusionMatrix(predictions, test_data$churn)

print(conf_matrix)

# Extract key metrics
accuracy <- conf_matrix$overall['Accuracy']
sensitivity <- conf_matrix$byClass['Sensitivity']  
specificity <- conf_matrix$byClass['Specificity']
\`\`\`

The model achieved:
- **Accuracy**: \`r round(accuracy * 100, 1)\`%
- **Sensitivity** (True Positive Rate): \`r round(sensitivity * 100, 1)\`%  
- **Specificity** (True Negative Rate): \`r round(specificity * 100, 1)\`%

## Feature Importance

\`\`\`{r feature-importance, fig.cap="Variable importance plot"}
importance_data <- importance(model) %>%
  as.data.frame() %>%
  rownames_to_column("variable") %>%
  arrange(desc(MeanDecreaseGini))

ggplot(importance_data[1:10, ], 
       aes(x = reorder(variable, MeanDecreaseGini), y = MeanDecreaseGini)) +
  geom_col(fill = "#3498db") +
  coord_flip() +
  labs(
    title = "Top 10 Most Important Variables",
    x = "Variables",
    y = "Mean Decrease in Gini"
  ) +
  theme_minimal()
\`\`\`

# Business Insights

Based on our analysis, the key drivers of customer churn are:

1. **\`r importance_data$variable[1]\`**: Highest importance score
2. **\`r importance_data$variable[2]\`**: Second most important factor  
3. **\`r importance_data$variable[3]\`**: Third most important factor

# Recommendations

1. **Focus on high-risk customers**: Use the model to identify customers with >50% churn probability
2. **Address key drivers**: Develop retention strategies targeting the most important features
3. **Monitor model performance**: Retrain monthly with new data

# Interactive Data Table

\`\`\`{r interactive-table}
# Create interactive table of high-risk customers
high_risk <- customer_data %>%
  mutate(churn_probability = predict(model, type = "prob")[,2]) %>%
  filter(churn_probability > 0.5) %>%
  arrange(desc(churn_probability)) %>%
  select(customer_id, churn_probability, everything())

datatable(
  high_risk,
  caption = "High-risk customers (>50% churn probability)",
  options = list(pageLength = 10, scrollX = TRUE),
  filter = "top"
) %>%
  formatPercentage("churn_probability", 1)
\`\`\`

# Conclusion

Our machine learning model successfully identifies customers at risk of churn with \`r round(accuracy * 100, 1)\`% accuracy. Implementation of targeted retention strategies should focus on the identified high-importance features.
`;

    it('should parse data science report with parameters', async () => {
      const result = await renderer.parse(dataScienceReport);

      expect(result.document.bibliographicEntry.title).toBe(
        'Customer Churn Analysis: Machine Learning Approach'
      );
      expect(result.metadata?.frontmatter?.params).toBeDefined();
      expect(result.metadata?.codeChunks).toHaveLength(7);
    });

    it('should handle inline R expressions', async () => {
      const result = await renderer.parse(dataScienceReport);

      expect(result.metadata?.inlineCode).toHaveLength(9);
      expect(result.metadata?.inlineCode?.some((code) => code.code.includes('Sys.Date()'))).toBe(
        true
      );
    });
  });

  describe('Course Material', () => {
    const courseMaterial = `---
title: "Introduction to Statistical Computing with R"
subtitle: "STAT 4580 - Week 3: Data Manipulation"
author: "Prof. Emily Rodriguez"
date: "Spring 2024"
output:
  bookdown::html_document2:
    toc: true
    toc_depth: 3
    number_sections: true
    code_folding: show
    theme: cosmo
    highlight: tango
---

# Learning Objectives {#sec:objectives}

By the end of this lesson, students will be able to:

1. Use dplyr verbs to manipulate data frames
2. Chain operations using the pipe operator
3. Create grouped summaries
4. Join multiple data sets

# Introduction to dplyr {#sec:intro}

The **dplyr** package is part of the tidyverse and provides a grammar of data manipulation. It includes several key verbs:

- \`filter()\`: Select rows based on conditions
- \`select()\`: Choose specific columns  
- \`mutate()\`: Create new variables
- \`arrange()\`: Sort rows
- \`summarise()\`: Calculate summary statistics
- \`group_by()\`: Group data for operations

## Getting Started

\`\`\`{r setup, message=FALSE}
# Load required packages
library(dplyr)
library(ggplot2)
library(nycflights13)

# Look at the flights data
glimpse(flights)
\`\`\`

# Basic dplyr Operations {#sec:basic}

## Filtering Rows

Use \`filter()\` to select rows that meet specific criteria:

\`\`\`{r filter-examples}
# Filter flights from JFK airport
jfk_flights <- flights %>%
  filter(origin == "JFK")

# Multiple conditions
winter_jfk <- flights %>%
  filter(origin == "JFK", month %in% c(12, 1, 2))

# Show first few rows
head(winter_jfk)
\`\`\`

::: {.callout-tip}
## Pro Tip
Use \`%in%\` to check if values are in a vector, rather than multiple OR conditions.
:::

## Selecting Columns

Use \`select()\` to choose specific columns:

\`\`\`{r select-examples}
# Select specific columns
flight_basics <- flights %>%
  select(year, month, day, carrier, flight, origin, dest)

# Select range of columns
time_cols <- flights %>%
  select(dep_time:arr_delay)

# Select columns by pattern
delay_cols <- flights %>%
  select(ends_with("delay"))

names(delay_cols)
\`\`\`

### Exercise 3.1 {#ex:select}

Complete the following tasks:

\`\`\`{r ex-3-1, eval=FALSE}
# TODO: Select only the columns related to departure information
departure_info <- flights %>%
  select(_____)

# TODO: Select all columns except the time-related ones  
no_times <- flights %>%
  select(_____)
\`\`\`

## Creating New Variables

Use \`mutate()\` to add new columns:

\`\`\`{r mutate-examples}
# Create new variables
flights_extended <- flights %>%
  mutate(
    # Calculate total delay
    total_delay = dep_delay + arr_delay,
    
    # Create delay categories
    delay_category = case_when(
      total_delay <= 0 ~ "On Time",
      total_delay <= 30 ~ "Minor Delay", 
      total_delay <= 60 ~ "Moderate Delay",
      TRUE ~ "Major Delay"
    ),
    
    # Convert distance to kilometers
    distance_km = distance * 1.609
  )

# Check the new variables
flights_extended %>%
  select(dep_delay, arr_delay, total_delay, delay_category, distance, distance_km) %>%
  head()
\`\`\`

# The Pipe Operator {#sec:pipe}

The pipe operator (\`%>%\`) allows you to chain operations together:

\`\`\`{r pipe-examples}
# Without pipes (nested functions)
result1 <- head(arrange(select(filter(flights, month == 1), 
                              carrier, dep_delay, arr_delay), 
                       dep_delay), 10)

# With pipes (much cleaner!)
result2 <- flights %>%
  filter(month == 1) %>%
  select(carrier, dep_delay, arr_delay) %>%
  arrange(dep_delay) %>%
  head(10)

# Both give the same result
identical(result1, result2)
\`\`\`

::: {.callout-note}
## Note
The pipe operator makes code more readable by following a left-to-right flow that matches how we think about data transformations.
:::

# Grouping and Summarising {#sec:group}

One of dplyr's most powerful features is the ability to group data and calculate summaries:

\`\`\`{r group-examples}
# Summary by carrier
carrier_summary <- flights %>%
  group_by(carrier) %>%
  summarise(
    flights_count = n(),
    avg_dep_delay = mean(dep_delay, na.rm = TRUE),
    avg_arr_delay = mean(arr_delay, na.rm = TRUE),
    max_distance = max(distance, na.rm = TRUE),
    .groups = "drop"  # Ungroup after summarising
  ) %>%
  arrange(desc(flights_count))

print(carrier_summary)
\`\`\`

## Multiple Grouping Variables

You can group by multiple variables:

\`\`\`{r multi-group}
# Monthly summary by origin airport
monthly_origin <- flights %>%
  group_by(origin, month) %>%
  summarise(
    flights = n(),
    avg_delay = mean(dep_delay, na.rm = TRUE),
    .groups = "drop"
  )

# Visualize the results
ggplot(monthly_origin, aes(x = month, y = avg_delay, color = origin)) +
  geom_line(size = 1) +
  geom_point(size = 2) +
  scale_x_continuous(breaks = 1:12, labels = month.abb) +
  labs(
    title = "Average Departure Delay by Month and Origin",
    x = "Month", 
    y = "Average Delay (minutes)",
    color = "Origin Airport"
  ) +
  theme_minimal()
\`\`\`

### Exercise 3.2 {#ex:group}

Create a summary showing the worst delays by destination:

\`\`\`{r ex-3-2, eval=FALSE}
worst_destinations <- flights %>%
  group_by(_____) %>%
  summarise(
    flights = _____,
    avg_dep_delay = _____,
    avg_arr_delay = _____,
    .groups = "drop"
  ) %>%
  filter(flights >= 100) %>%  # Only destinations with 100+ flights
  arrange(_____)

head(worst_destinations, 10)
\`\`\`

# Joining Data Sets {#sec:joins}

dplyr provides several functions for combining data sets:

\`\`\`{r join-examples}
# Get airline names
airlines_info <- flights %>%
  left_join(airlines, by = "carrier") %>%
  select(carrier, name) %>%
  distinct()

print(airlines_info)

# Add airport information
airport_delays <- flights %>%
  group_by(origin) %>%
  summarise(avg_delay = mean(dep_delay, na.rm = TRUE), .groups = "drop") %>%
  left_join(airports, by = c("origin" = "faa")) %>%
  select(origin, name, avg_delay) %>%
  arrange(desc(avg_delay))

print(airport_delays)
\`\`\`

## Types of Joins

Figure \\@ref(fig:join-types) illustrates the different types of joins:

\`\`\`{r join-types, fig.cap="Types of joins in dplyr", echo=FALSE, out.width="80%"}
knitr::include_graphics("images/join_types.png")
\`\`\`

# Practice Problems {#sec:practice}

## Problem 1: Flight Analysis

Using the flights data, answer these questions:

\`\`\`{r practice-1, eval=FALSE}
# 1. Which carrier has the most flights?
most_flights <- ____

# 2. What's the average delay for each month?
monthly_delays <- ____

# 3. Which route (origin-destination pair) has the longest average flight time?
longest_route <- ____
\`\`\`

## Problem 2: Advanced Analysis

Create a comprehensive analysis:

\`\`\`{r practice-2, eval=FALSE}
# Create a summary showing:
# - Each carrier's performance by month
# - Include: number of flights, average delays, on-time percentage
# - Only include carriers with 1000+ annual flights

carrier_performance <- flights %>%
  # Your code here
  _____
\`\`\`

# Solutions {#sec:solutions}

::: {.callout-caution collapse="true"}
## Click to see solutions

### Exercise 3.1 Solution

\`\`\`{r sol-3-1}
# Select departure information
departure_info <- flights %>%
  select(year, month, day, dep_time, sched_dep_time, dep_delay)

# Select all except time columns
no_times <- flights %>%
  select(-c(dep_time, sched_dep_time, arr_time, sched_arr_time))
\`\`\`

### Exercise 3.2 Solution

\`\`\`{r sol-3-2}
worst_destinations <- flights %>%
  group_by(dest) %>%
  summarise(
    flights = n(),
    avg_dep_delay = mean(dep_delay, na.rm = TRUE),
    avg_arr_delay = mean(arr_delay, na.rm = TRUE),
    .groups = "drop"
  ) %>%
  filter(flights >= 100) %>%
  arrange(desc(avg_arr_delay))

head(worst_destinations, 10)
\`\`\`

:::

# Summary {#sec:summary}

In this lesson, we covered the core dplyr verbs:

- **filter()**: Select rows
- **select()**: Choose columns  
- **mutate()**: Create variables
- **arrange()**: Sort data
- **summarise()**: Calculate summaries
- **group_by()**: Group operations

These tools form the foundation of data manipulation in R and will be essential for your data analysis projects.

# Next Week

Next week we'll learn about:
- Data visualization with ggplot2
- Statistical modeling basics
- Reproducible reporting

---

*For questions about this material, please visit office hours or post in the course forum.*
`;

    it('should parse course material with exercises', async () => {
      const result = await renderer.parse(courseMaterial);

      expect(result.document.bibliographicEntry.title).toBe(
        'Introduction to Statistical Computing with R'
      );
      expect(result.metadata?.codeChunks).toHaveLength(12);
      expect(result.metadata?.crossReferences).toHaveLength(8);
    });

    it('should render with course materials configuration', async () => {
      const parseResult = await renderer.parse(courseMaterial);
      const renderResult = await renderer.render(
        parseResult.document,
        ACADEMIC_WORKFLOW_CONFIGS.COURSE_MATERIALS
      );

      expect(renderResult.content).toContain('bookdown::gitbook');
      expect(renderResult.content).toContain('collapse=TRUE');
    });
  });
});
