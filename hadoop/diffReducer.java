package edu.upenn.nets212.hw3;

import org.apache.hadoop.io.DoubleWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Reducer;
import org.apache.hadoop.mapreduce.Reducer.Context;

public class diffReducer extends Reducer<Text, Text, Text, DoubleWritable> {
	// Check weight differences for the vertex
	public void reduce(Text key, Iterable<DoubleWritable> values, Context context) 
	  		throws java.io.IOException, InterruptedException
	{
		// Keep a map of the entries seens so far, and store diffs in the map
		Map<String, Double> weights = new HashMap<String, Double>();\

		for (Text value : values) {
			String[] values = value.get().split(" ");
			if (weights.containsKey(values[0])) {
				weights.put(values[0], Double.parseDouble(values[1]));
			} else {
				weights.put(values[0], Math.abs(weights.get(values[0]) - double.parseDouble(values[1])));
			}
		}
		double diff = 0;
		for (Double weightDiff : weights.values()){
			diff += weightDiff;
    	}

		context.write(new Text(""), new DoubleWritable(weightDiff));
	}
}
