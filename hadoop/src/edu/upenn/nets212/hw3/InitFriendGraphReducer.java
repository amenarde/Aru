package edu.upenn.nets212.hw3;

import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Reducer;
import org.apache.hadoop.mapreduce.Reducer.Context;

public class InitFriendGraphReducer extends Reducer<Text, Text, Text, Text> {
	public void reduce(Text key, Iterable<Text> values, Context context) 
	  		throws java.io.IOException, InterruptedException
	  {
		// Consolidate values into a string of format: 
		// id [adjList] [label, weight] - since first iter label will be id and weight will be 1
		StringBuilder sb = new StringBuilder();
		
		for (Text vertex : values) {
			sb.append(" " + vertex);
		}
		// Initialize rank to start at 1
		sb.append("\t" + key + " " +  1);
		sb.deleteCharAt(0);
		context.write(key, new Text(sb.toString()));
	  }
}
