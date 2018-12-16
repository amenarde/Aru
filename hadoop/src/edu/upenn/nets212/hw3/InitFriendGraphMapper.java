package edu.upenn.nets212.hw3;

import org.apache.hadoop.mapreduce.*;
import org.apache.hadoop.mapreduce.Mapper.Context;

import org.apache.hadoop.io.*;

public class InitFriendGraphMapper extends Mapper<LongWritable, Text, Text, Text> {
	// Take the input format and consolidate information of connections betwee nodes
	// Each vertex should have form: id [adjList] [labels and weights to prop]
	public void map(LongWritable key, Text value, Context context) 
			throws java.io.IOException, InterruptedException
	{
		// Takes in line of form v1, v2
		String[] edge = value.toString().split("\t");
		// want weighted directed edges, so just pass the data along
		context.write(new Text(edge[0]), new Text(edge[1]));
	}
}