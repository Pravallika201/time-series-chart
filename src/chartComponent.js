// ChartComponent.js
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import localforage from 'localforage';

const ChartComponent = () => {
  const svgRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchFromDatabase();
      await localforage.setItem('timeSeriesData', data);
      renderChart(data);
    };

    localforage.getItem('timeSeriesData').then((data) => {
      if (data) {
        renderChart(data);
      } else {
        fetchData();
      }
    });
  }, []);

  const renderChart = (data) => {
    const margin = { top: 20, right: 30, bottom: 30, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.date))
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)])
      .nice()
      .range([height, 0]);

    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y);

    svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis);

    svg.append('g')
      .attr('class', 'y-axis')
      .call(yAxis);

    const line = d3.line()
      .x(d => x(d.date))
      .y(d => y(d.value));

    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 1.5)
      .attr('d', line);

    // Implement zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([1, 10])
      .translateExtent([[0, 0], [width, height]])
      .extent([[0, 0], [width, height]])
      .on('zoom', zoomed);

    svg.append('rect')
      .attr('class', 'zoom')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .call(zoom);

    function zoomed(event) {
      const newX = event.transform.rescaleX(x);
      svg.select('.x-axis').call(xAxis.scale(newX));
      svg.select('path').attr('d', line.x(d => newX(d.date)));
    }
  };

  const fetchFromDatabase = async () => {
    // Simulated function to fetch data from database
    // Simulate fetching data from a database
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
    return d3.timeHours(new Date(2022, 0, 1), new Date(2022, 0, 10)).map(date => ({
      date,
      value: Math.random() * 100
    }));
  };

  return <svg ref={svgRef}></svg>;
};

export default ChartComponent;
