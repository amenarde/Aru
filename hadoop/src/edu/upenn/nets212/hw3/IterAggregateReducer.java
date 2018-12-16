package edu.upenn.nets212.hw3;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.Map.Entry;

import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Reducer;
import org.apache.hadoop.mapreduce.Reducer.Context;

public class IterAggregateReducer extends Reducer<Text, Text, Text, Text> {	
	// Consolidates weights for the adsorption algorithm
	public void reduce(Text key, Iterable<Text> values, Context context) 
	  		throws java.io.IOException, InterruptedException
		{	
			String adjList = "";
			// Aggregate 
			// Keep a map of the weight for each key seen so far
			Map<String, Double> weightTracker = new HashMap<String, Double>();
			Double normalizer = 0.0;
			for (Text value : values) {
				if (value.toString().endsWith("\t")) {
					// Got an adjaceny list
					adjList = value.toString();
				} else {
					// Have destination - weight
					String[] labelWeight = value.toString().split(" ");
					if (weightTracker.containsKey(labelWeight[0])) {
						weightTracker.put(labelWeight[0], weightTracker.get(labelWeight[0]) + Double.parseDouble(labelWeight[1]));
					} else {
						weightTracker.put(labelWeight[0], Double.parseDouble(labelWeight[1]));
					}
					normalizer += Double.parseDouble(labelWeight[1]);
				}
			}
			
			// Iterate through the map and emit the new pairings
			for (Entry<String,Double> pair : weightTracker.entrySet()){
		        // Prepare weights to be sent to destinations (label them, and output with destination as key)
				context.write(new Text(pair.getKey()), new Text(key + " " + pair.getValue()/normalizer));
		    }
			// This should never happen - can only be considered if appeared in an edge in the first place
			if (adjList == "") {
				// Need to do something about adjList not being passed
				adjList = "\t";
			}
			// Output the adjList for the vertex (identified by tab and comma
			context.write(key, new Text(adjList + ","));
	  }
}
