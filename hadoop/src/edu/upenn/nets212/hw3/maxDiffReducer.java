package edu.upenn.nets212.hw3;

import org.apache.hadoop.io.DoubleWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Reducer;
import org.apache.hadoop.mapreduce.Reducer.Context;

public class maxDiffReducer extends Reducer<Text, DoubleWritable, Text, DoubleWritable> {
	
	public void reduce(Text key, Iterable<DoubleWritable> values, Context context) 
	  		throws java.io.IOException, InterruptedException
	{
//		Double prev = null;	// Rank should never be negative?
//		Double result = null;
//		for (DoubleWritable value : values) {
//			if (prev != null) {
//				result = Math.abs(prev - value.get());
//			}
//			prev = value.get();
//		}
//		
//		if (result == null) {
//			result = Math.abs(1 - prev);
//		}
		Double max = 0.0;
		for (DoubleWritable value : values) {
			if (value.get() > max) {
				max = value.get();
			}
		}
		context.write(new Text(""), new DoubleWritable(max));
	}
}
