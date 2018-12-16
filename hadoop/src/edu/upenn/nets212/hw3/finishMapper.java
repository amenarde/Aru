package edu.upenn.nets212.hw3;

import org.apache.hadoop.io.DoubleWritable;
import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;
import org.apache.hadoop.mapreduce.Mapper.Context;

public class finishMapper extends Mapper<LongWritable, Text, Text, Text> {
	// Take string of form
		// id [adjList] [value weight]
	// and return strings of form
		// v2 id weight
	public void map(LongWritable key, Text value, Context context) 
			throws java.io.IOException, InterruptedException
	{
		String[] components = value.toString().split("\t");
		String[] labelsAndWeights = components[2].split(" ");
		for (int i = 0; i < labelsAndWeights.length/2; i++) {
			Text reducerkey = new Text(labelsAndWeights[i*2]);
			context.write(reducerkey, new Text(components[0] + " " + labelsAndWeights[i * 2 + 1]));
		}
	}
}
