# ETFA 2024
Online appendix for a study on leveraging the power of LLMs to transform robot programs into low-code through their abstraction, submitted to the 29<sup>th</sup> International Conference on Emerging Technologies and Factory Automation ([ETFA 2024](https://2024.ieee-etfa.org/)).

## Authors
- [Bernhard Schenkenfelder](https://github.com/bernland)
- Christian Salomon
- Martin Schwandtner
- Raphael Zefferer
- Michael Derfler
- Manuel Wimmer

## JavaConverter

The Angular based JSON to Java Converter can be found in `JavaConverter/java-creator`. Examples of a process in JSON and in Java can be found in `JavaConverter/Examples`. To use the JavaConverter, open the `java-creator` folder and install the needed node modules with `npm install`. To run the converter either use `ng serve` or `npm start`. The converted Java class will be printed in the console of your webbrowser. To change the JSON change the `Example.json` in `JavaConverter/java-creator/src/assets`. The application runs on the address `http://localhost:4200/` after start.