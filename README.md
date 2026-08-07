# :file_folder: gtihub stats project

This is a project for an api that returns svg to insert in your readme file in github

# 🏗️ Base idea

```
            /--> username (for github info) ----> infos for GITHUB'S PUBLIC API
            |
            +--> platform (maybe in future can be implemented more features with other platforms)   \
            |                                                                                       |
            +--> model (type of dashboard ios requested)                                            +---> infos for API
            |                                                                                       |
            +--> style (style of the model)                                                         /
            |
user ----request----> API ----request----> GITHUB'S PUBLIC API
  \---response svg----/  \-----response json------/

```


## 📈 How is the Developer Score calculated?

The score ranges from **10 to 100** and is based on 3 main pillars:

* 📊 **55% - Activity (Volume)**
  Tracks the actual days you coded over the last month, along with closed PRs and resolved Issues. It uses a logarithmic scale to reward steady work and prevent score inflation from bot spam or dozens of micro-commits in a single day.

* ⚡ **25% - Quality (Efficiency)**
  Evaluates your code health by looking at your PR merge rate (accepted vs. closed PRs) and the average speed (in days) it takes to merge PRs and resolve Issues.

* 🔥 **20% - Consistency (Discipline)**
  Tied directly to your **Current Streak**. A streak of 8 consecutive coding days is enough to max out this section!

---

## 🏆 Ranks

Your total score assigns you a Rank:

* 🥇 **S+** (90–100)
* 🥇 **A+** (80–89)
* 🥈 **A**  (65–79)
* 🥉 **B**  (45–64)
* 🎖️ **C**  (< 45)

---

## ℹ️ Other Info

* 🤖 SVG card styling and layouts optimized with AI assistance.
* 💻 Powered entirely by free, public GitHub APIs (no tokens needed) and hosted for free on Vercel.
