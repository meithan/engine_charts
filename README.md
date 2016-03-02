# Optimal Engine Charts v1.1.1

#### An interactive webapp for Kerbal Space Program 1.0.5

##### Live URL: [http://meithan.net/KSP/engines](http://meithan.net/KSP/engines/)

#### Description

This webapp will let you compute interactive optimal engine charts on demand. The goal is to answer this general question:

* What is the optimal engine for a given payload mass and desired Δv, subject to a minimum TWR (or acceleration) restriction, where by optimal we mean that the resulting ship should have the least possible mass?

#### How to use the app

Basic instructions:

1. Choose a fixed variable out of Payload mass, Minimum TWR or Delta-v. The remaining two variables will be the axes of the 2D plot.
2. Fill in the chart parameters, including the values or ranges of the variables, as well as atmospheric pressure and the maximum number of engines.
3. Select which engines should be included in the analysis by clicking on the checkboxes to the right.
4. Click "Calculate!" and the chart will appear below; details will be shown on the panel to the right.

The chart is interactive:

* Mouse over the chart to see details for the point under the mouse in the panel to the right.
* Click on the chart to lock the details panel to a specific point in the chart; click again to unlock.
* Click-and-drag to pan the currently displayed view; the chart will be recomputed with the new ranges.
* Hold the CTRL key and click-and-drag to select an area to zoom in.
* Use the buttons under the chart to expand/shrink the ranges, recall previous settings or save the chart.

You can get more help by opening the collapsible areas by clicking on the ? buttons. Some extra details are also given by mousing over the i tooltips.

Fore more info (like details on how the calculations are done) or to leave a message or bug report, visit the [development thread](http://forum.kerbalspaceprogram.com/index.php?/topic/114995-web-105-optimal-engine-charts-interactive-webapp/) at the KSP forums.

##### Version history

* 1.1.1 (March 2, 2016): Set default maximum number of engines to 10, other minor fixes (default fixed variable is now correctly set, fixed min/avg/max row dislay in runner-up details).
* 1.1.0 (February 22, 2016): Added fixed variable selector, moved project to Github, refactored a lot of code.
* 1.0.1 (February 19, 2016): Updated engine stats to 1.0.5 (only change is the addition of the Vector engine).
* 1.0.0 (June 30, 2015): Initial release.

##### License

Optimal Engine Charts is free software licensed under the GNU General Public License v3. Third-party additional software is used under the terms of the corresponding licenses. Built with Paper.js and jquery.js. Styles by Twitter Bootstrap. Icons by Glyphicons.

Copyleft ![](http://i.imgur.com/4R84dsR.png) Meithan West, 2016. Some rights reserved.
