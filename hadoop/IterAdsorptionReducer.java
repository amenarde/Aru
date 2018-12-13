package edu.upenn.nets212.hw3;

import java.util.Arrays;

import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Reducer;
import org.apache.hadoop.mapreduce.Reducer.Context;

public class IterAdsorptionReducer extends Reducer<Text, Text, Text, Text> {
	private double D = 0.15;
	
	// Consolidates weights for the adsorption algorithm
	public void reduce(Text key, Iterable<Text> values, Context context) 
	  		throws java.io.IOException, InterruptedException
		{	
			String adjList = "";
			// Aggregate 
			StringBuilder sb = new StringBuilder();
			for (Text value : values) {
				if (value.startsWith("|")) {
					// Got an adjaceny list
					adjList = value;
				} else {
					// Add weights and labels to the vertex info
					sb.append(value);
				}
			}
			if (adjList = "") {
				// Need to do something about adjList not being passed
				adjList = "||";
			}
			// Make the vertex string
			context.write(key, new Text(adjList + sb.toString()));
	  }
}
