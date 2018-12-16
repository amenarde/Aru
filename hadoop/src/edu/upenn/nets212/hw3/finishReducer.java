package edu.upenn.nets212.hw3;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.apache.hadoop.io.DoubleWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Reducer;
import org.apache.hadoop.mapreduce.Reducer.Context;

public class finishReducer extends Reducer<Text, Text, Text, Text> {
	public void reduce(Text key, Iterable<Text> values, Context context) 
	  		throws java.io.IOException, InterruptedException
	{
		for (Text value : values) {
			context.write(key, value);
		}
//		List<String> weightPairs = new ArrayList<String>();
//		for (Text value : values) {
//			weightPairs.add(value.toString());
//		}
//		weightPairs.sort(new WeightComparator());
//		for (String value : weightPairs) {
//			context.write(key, new Text(value));
//		}
		
	}
	
	public class WeightComparator implements Comparator<String> {
	    @Override
	    public int compare(String o1, String o2) {
	    	String[] keyW = o1.split(" ");
	    	String[] keyW2 = o1.split(" ");
	        return Double.compare(Double.parseDouble(keyW[1]), Double.parseDouble(keyW2[1]));
	    }
	}
}
