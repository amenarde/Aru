package edu.upenn.nets212.hw3;

import org.apache.hadoop.io.DoubleWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Reducer;
import org.apache.hadoop.mapreduce.Reducer.Context;

public class finishReducer extends Reducer<DoubleWritable, Text, Text, Text> {
	public void reduce(Text key, Iterable<Text> values, Context context) 
	  		throws java.io.IOException, InterruptedException
	{
		for (Text value : values) {
			context.write(key, value);
		}
	}
}
