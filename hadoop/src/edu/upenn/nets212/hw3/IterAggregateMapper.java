package edu.upenn.nets212.hw3;

import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;
import org.apache.hadoop.mapreduce.Mapper.Context;

public class IterAggregateMapper extends Mapper<LongWritable, Text, Text, Text> {
	// Distributee weights for the adsorption 
	public void map(LongWritable key, Text value, Context context) 
			throws java.io.IOException, InterruptedException
	{
		// Split line into components - id, adjList, labels and weights
		String[] components = value.toString().split("\t");
		if (components.length == 3) {
			String[] adjList = components[1].split(" ");	// Remember to account for space at beginning
			String[] labelsAndWeights = components[2].split(" ");

			// Propogate labels along edges
			StringBuilder sb = new StringBuilder();
			for (int i = 0; i < adjList.length/2; i++) {
				// Account for fact that list is half as long due to tuples
				for (int j = 0; j < labelsAndWeights.length/2; j++) {
					String label = labelsAndWeights[j * 2];
					double weight = Double.parseDouble(labelsAndWeights[j * 2 + 1]);
					// Update weight (pass along edge)
					weight = weight * Double.parseDouble(adjList[i * 2 + 1]);
					
					// Send weight to be aggregated and normalized (send label for where should go next)
					// Form : Key - label, Value - destination weight
					context.write(new Text(label), new Text(adjList[i * 2] + " " + weight));
					
//					// Send weight to be added to vertex
//					context.write(new Text(adjList[i * 2]), new Text(label + " " + weight));
				}
			}
			// Add the adjacency list with spacer
			sb.append(components[1]);
			sb.append("\t");
			// Send adjList to key to keep it in memory
			context.write(new Text(components[0]), new Text(sb.toString()));
			// Send shadow weight to self
			context.write(new Text(components[0]), new Text(components[0] + " " + 1));
		} else {
			System.out.println("Improperly formatted file to Iter mapper");
		}
	}
}
