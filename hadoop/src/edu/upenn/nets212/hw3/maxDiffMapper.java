package edu.upenn.nets212.hw3;

import org.apache.hadoop.io.DoubleWritable;
import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;
import org.apache.hadoop.mapreduce.Mapper.Context;

public class maxDiffMapper extends Mapper<LongWritable, Text, Text, DoubleWritable> {
	public void map(LongWritable key, Text value, Context context) 
			throws java.io.IOException, InterruptedException
	{
		String[] weight = value.toString().split("\t");
		
		double diff = Double.parseDouble(weight[1]);
		// Send all values to a single reducer to leverage mapReduce sort
		context.write(new Text("HandOfGod"), new DoubleWritable(diff));
	}
}
