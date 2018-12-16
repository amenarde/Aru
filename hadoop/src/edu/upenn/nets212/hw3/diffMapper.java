package edu.upenn.nets212.hw3;

import org.apache.hadoop.io.DoubleWritable;
import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;
import org.apache.hadoop.mapreduce.Mapper.Context;

public class diffMapper extends Mapper<LongWritable, Text, Text, Text> {
	
	public void map(LongWritable key, Text value, Context context) 
			throws java.io.IOException, InterruptedException
	{
		// Compare the difference in labeled weight for a node
		String[] components = value.toString().split("\t");
		
		String[] labelsAndWeights = components[2].split(" ");
		for (int i = 0; i < labelsAndWeights.length/2; i++) {
			Text reducerkey = new Text(components[0]);
			// Send the id of the node, and the label and weight
			context.write(reducerkey, new Text(labelsAndWeights[i * 2] + " " + labelsAndWeights[i * 2 + 1]));
		}
	}
}
