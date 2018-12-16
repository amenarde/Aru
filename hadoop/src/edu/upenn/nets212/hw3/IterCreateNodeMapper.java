package edu.upenn.nets212.hw3;

import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;
import org.apache.hadoop.mapreduce.Mapper.Context;

public class IterCreateNodeMapper extends Mapper<LongWritable, Text, Text, Text> {
	// Distributee weights for the adsorption 
	public void map(LongWritable key, Text value, Context context) 
			throws java.io.IOException, InterruptedException
	{
		// Values either have form: vertex id \t label value
		// or vertex adjList \t ,
		String[] components = value.toString().split("\t");
		if (components.length == 3) {
			// Have adjList in position 2
			context.write(new Text(components[0]), new Text(components[1] + "\t"));
		} else if (components.length == 2) {
			// Have vertex in pos 1 and label, value in pos 2
			context.write(new Text(components[0]), new Text(components[1]));
		} else {
			System.out.println("Improperly formatted file to Iter mapper");
		}
	}
}
