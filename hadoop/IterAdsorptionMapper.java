package edu.upenn.nets212.hw3;

import org.apache.hadoop.io.DoubleWritable;
import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;
import org.apache.hadoop.mapreduce.Mapper.Context;

public class IterAdsorptionMapper extends Mapper<LongWritable, Text, Text, Text> {
	// Distributee weights for the adsorption 
	public void map(LongWritable key, Text value, Context context) 
			throws java.io.IOException, InterruptedException
	{
		// Split line into components - id, adjList, labels and weights
		String[] components = value.split("|");
		System.out.println("\n\nRecieved line: " + value);
		if (components.length == 3) {
			String[] adjList = components[1].split(" ");	// Remember to account for space at beginning
			String[] labelsAndWeights = components[2].split(" ");

			// Propogate labels along edges
			StringBuilder sb = new StringBuilder();
			sb.append("|");
			for (int i = 0; i < adjList.length; i++) {
				// Account for fact that list is half as long due to tuples
				for (int j = 0; j < labelsAndWeights/2; j++) {
					String label = labelsAndWeights[j * 2];
					double weight = Double.parseDouble(labelsAndWeights[j * 2 + 1]);
					// Scale weight for edge
					weight = weight/adjList.length;
					// Send weight to be added to vertex
					context.write(new Text(adjList[i]), new Text(label + " " + weight));
				}
				sb.append(" " + adjList[i]);
			}
			sb.append("|");
			// Send adjList to key to keep it in memory
			context.write(\components[0], new Text(sb.toString()));
		} else {
			System.out.println("Improperly formatted file to Iter mapper");
		}
	}
}
