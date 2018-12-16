package edu.upenn.nets212.hw3;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.Map.Entry;

import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Reducer;
import org.apache.hadoop.mapreduce.Reducer.Context;

public class IterCreateNodeReducer extends Reducer<Text, Text, Text, Text> {
	
	// Consolidates weights for the adsorption algorithm
	public void reduce(Text key, Iterable<Text> values, Context context) 
	  		throws java.io.IOException, InterruptedException
		{	
			String adjList = "";
			// Aggregate 
			StringBuilder sb = new StringBuilder();
			// Keep a map of the weight for each key seen so far
			Map<String, Double> weightTracker = new HashMap<String, Double>();
			for (Text value : values) {
				if (value.toString().endsWith("\t")) {
					// Got an adjaceny list
					adjList = value.toString();
				} else {
					// Add weights and labels to the vertex info
					String[] labelWeight = value.toString().split(" ");
					if (weightTracker.containsKey(labelWeight[0])) {
						weightTracker.put(labelWeight[0], weightTracker.get(labelWeight[0]) + Double.parseDouble(labelWeight[1]));
					} else {
						weightTracker.put(labelWeight[0], Double.parseDouble(labelWeight[1]));
					}
				}
			}
			
			// Iterate through the map and aggregate weights into list
			for (Entry<String,Double> pair : weightTracker.entrySet()){
		        //iterate over the pairs
				sb.append(" " + pair.getKey() + " " + pair.getValue());
		    }
			
			sb.deleteCharAt(0);
			// This should never happen - can only be considered if appeared in an edge in the first place
			if (adjList == "") {
				// Need to do something about adjList not being passed
				adjList = "\t";
			}
			// Make the vertex string
			context.write(key, new Text(adjList + sb.toString()));
	  }
}
