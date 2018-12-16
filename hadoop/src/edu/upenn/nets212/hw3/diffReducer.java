package edu.upenn.nets212.hw3;

import java.util.HashMap;
import java.util.Map;

import org.apache.hadoop.io.DoubleWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Reducer;
import org.apache.hadoop.mapreduce.Reducer.Context;

public class diffReducer extends Reducer<Text, Text, Text, DoubleWritable> {
	// Check weight differences for the vertex
	public void reduce(Text key, Iterable<Text> values, Context context) 
	  		throws java.io.IOException, InterruptedException
	{
		// Keep a map of the entries seens so far, and store diffs in the map
		Map<String, Double> weights = new HashMap<String, Double>();

		for (Text value : values) {
			String[] weight = value.toString().split(" ");
			if (weights.containsKey(weight[0])) {
				weights.put(weight[0], Math.abs(weights.get(weight[0]) - Double.parseDouble(weight[1])));
			} else {
				weights.put(weight[0], Double.parseDouble(weight[1]));
			}
		}
		double diff = 0;
		for (Double weightDiff : weights.values()){
			diff += weightDiff;
    	}
		context.write(new Text(""), new DoubleWritable(diff));
	}
}
