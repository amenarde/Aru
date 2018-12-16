package edu.upenn.nets212.hw3;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URI;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.FSDataInputStream;
import org.apache.hadoop.fs.FileStatus;
import org.apache.hadoop.fs.FileSystem;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.io.DoubleWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Job;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;

public class FriendRecomendationDriver 
{
  public static void main(String[] args) throws Exception 
  {
	  System.out.println("Pennbook (jtagg, amenarde, tyang)");
	  
	  if (args.length == 0) {
		  System.err.println("Usage: any of the following commands");
		  System.err.println("init <inputDir> <outputDir> <#reducers>");
		  System.err.println("iter <inputDir> <outputDir> <#reducers>");
		  System.err.println("diff <inputDir1> <inputDir2> <outputDir> <#reducers>");
		  System.err.println("finish <inputDir> <outputDir> <#reducers>");
		  System.err.println("composite <inputDir> <outputDir> <intermDir1> <intermDir2> <diffDir> <#reducers>");
	      System.exit(-1);
	  } else if (args[0].equals("composite")) {
		  if (args.length == 7) {
			  FriendRecomendationDriver.composite(args[1], args[2], args[3], args[4], args[5], Integer.parseInt(args[6]));
		  } else {
			  System.err.println("Usage: composite <inputDir> <outputDir> <intermDir1> <intermDir2> <diffDir> <#reducers>");
		  }
	  } else if (args[0].equals("init")) {
		  if (args.length != 5) {
			  System.out.println(args);
			  FriendRecomendationDriver.init(args[1], args[2], Integer.parseInt(args[3]));
		  } else {
			  System.err.println("Usage: init <inputDir> <outputDir> <#reducers>");
		  }
	  } else if (args[0].equals("iter")) {
		  if (args.length != 5) {
			  FriendRecomendationDriver.iter(args[1], args[2], Integer.parseInt(args[3]));
		  } else {
			  System.err.println("Usage: iter <inputDir> <outputDir> <#reducers>");
		  }
	  } else if (args[0].equals("diff")) {
		  if (args.length != 6) {
			  FriendRecomendationDriver.diff(args[1], args[2], args[3], "GODTMP", Integer.parseInt(args[4]));
		  } else {
			  System.err.println("Usage: iter <inputDir> <outputDir> <#reducers>");
		  }
	  } else if (args[0].equals("finish")) {
		  if (args.length != 5) {
			  FriendRecomendationDriver.finish(args[1], args[2], Integer.parseInt(args[3]));
		  } else {
			  System.err.println("Usage: finish <inputDir> <outputDir> <#reducers>");
		  }
	  } else {
		  System.err.println("Command not found!");
		  System.err.println("Available: any of the following commands");
		  System.err.println("init <inputDir> <outputDir> <#reducers>");
		  System.err.println("iter <inputDir> <outputDir> <#reducers>");
		  System.err.println("diff <inputDir1> <inputDir2> <outputDir> <#reducers>");
		  System.err.println("finish <inputDir> <outputDir> <#reducers>");
	      System.exit(-1);
	  }
	    
  }
  
  // init <inputDir><outputDir><#reducers>
  public static void init(String inputDir, String outputDir, int numReducers) 
  	throws Exception
  {
	  // Read the file(s) in the input directory, convert them to intermediate format, output data to output dir using specified num of reducers
	  // Consolidate into info about one node (all edges leaving)
	  // Need node, rank, people they point to
	  
	  // Delete output Dir if exists
	  FriendRecomendationDriver.deleteDirectory(outputDir);
	  
	  Job job = new Job();
	  job.setJarByClass(FriendRecomendationDriver.class);
	    
	  job.setMapperClass(InitFriendGraphMapper.class);
	  job.setReducerClass(InitFriendGraphReducer.class);
	    
	  job.setMapOutputKeyClass(Text.class);
	  job.setMapOutputValueClass(Text.class);
	    
	  job.setOutputKeyClass(Text.class);
	  job.setOutputValueClass(Text.class);
	  
	  job.setNumReduceTasks(numReducers);
	    
	  FileInputFormat.addInputPath(job, new Path(inputDir));
	  FileOutputFormat.setOutputPath(job, new Path(outputDir));
	  
	  // Run the job
	  job.waitForCompletion(true);
  }
  
  // iter <inputDir> <outputDir> <#reducers>
  public static void iter(String inputDir, String outputDir, int numReducers) 
  	throws Exception
  {
	  String intermediateDir = "InterimDir";
	  // Perform a single round of SocialRank
	  // Data in inputDir should be intermediate format
	  // Output scores to outputDir
	  // Make sure outputDir does not exist
	  FriendRecomendationDriver.deleteDirectory(outputDir);
	  FriendRecomendationDriver.deleteDirectory(intermediateDir);
	  
	  Job job = new Job();
	  job.setJarByClass(FriendRecomendationDriver.class);
	    
	  job.setMapperClass(IterAggregateMapper.class);
	  job.setReducerClass(IterAggregateReducer.class);
	    
	  job.setMapOutputKeyClass(Text.class);
	  job.setMapOutputValueClass(Text.class);
	    
	  job.setOutputKeyClass(Text.class);
	  job.setOutputValueClass(Text.class);
	  
	  job.setNumReduceTasks(numReducers);
	    
	  FileInputFormat.addInputPath(job, new Path(inputDir));
	  FileOutputFormat.setOutputPath(job, new Path(intermediateDir));
	  
	  // Take the intermediate results and combine them back into nodes
	  job.waitForCompletion(true);
	  
	  job = new Job();
	  job.setJarByClass(FriendRecomendationDriver.class);
	    
	  job.setMapperClass(IterCreateNodeMapper.class);
	  job.setReducerClass(IterCreateNodeReducer.class);
	    
	  job.setMapOutputKeyClass(Text.class);
	  job.setMapOutputValueClass(Text.class);
	    
	  job.setOutputKeyClass(Text.class);
	  job.setOutputValueClass(Text.class);
	  
	  job.setNumReduceTasks(numReducers);
	    
	  FileInputFormat.addInputPath(job, new Path(intermediateDir));
	  FileOutputFormat.setOutputPath(job, new Path(outputDir));
	  
	  // Run the job
	  job.waitForCompletion(true);
  }
  
  // diff <inputDir1> <inputDir2> <outputDir> <#reducers>
  public static void diff(String inputDir1, String inputDir2, String outputDir, String tempDir, int numReducers) throws Exception { 
	  // Read intermediate format from both input dirs
	  // output a single line containing max diff between any pair of rank values for same vertex
	  // Diff will always be positive (take absolute value)
	  
	  // Delete existing outputDir if exists
	  FriendRecomendationDriver.deleteDirectory(outputDir);
	  FriendRecomendationDriver.deleteDirectory(tempDir);
	  
	  // Job for collecting values
	  Job job = new Job();
	  job.setJarByClass(FriendRecomendationDriver.class);
	    
	  job.setMapperClass(diffMapper.class);
	  job.setReducerClass(diffReducer.class);
	    
	  job.setMapOutputKeyClass(Text.class);
	  job.setMapOutputValueClass(Text.class);
	    
	  job.setOutputKeyClass(Text.class);
	  job.setOutputValueClass(DoubleWritable.class);
	  
	  job.setNumReduceTasks(numReducers);
	    
	  FileInputFormat.addInputPath(job, new Path(inputDir1));
	  FileInputFormat.addInputPath(job, new Path(inputDir2));
	  FileOutputFormat.setOutputPath(job, new Path(tempDir));
	  
	  // Run the job
	  job.waitForCompletion(true);
	    
	  // Find the new max
	  job = new Job();
	  job.setJarByClass(FriendRecomendationDriver.class);
	    
	  job.setMapperClass(maxDiffMapper.class);
//	  job.setCombinerClass(diffReducer.class);
	  job.setReducerClass(maxDiffReducer.class);
	    
	  job.setMapOutputKeyClass(Text.class);
	  job.setMapOutputValueClass(DoubleWritable.class);
	    
	  job.setOutputKeyClass(Text.class);
	  job.setOutputValueClass(DoubleWritable.class);
	  
	  // Set to one reducer to accomodate the reading function
	  // Consider changing the read function to allow multiple reducers
	  job.setNumReduceTasks(1);
	    
	  FileInputFormat.addInputPath(job, new Path(tempDir));
	  FileOutputFormat.setOutputPath(job, new Path(outputDir));
	  
	  // Run the job
	  job.waitForCompletion(true);
	  
	  // Delete the temp dir
	  FriendRecomendationDriver.deleteDirectory(tempDir);
  }
  
  // finish <inputDir> <outputDir> <#reducers>
  public static void finish(String inputDir, String outputDir, int numReducers) throws Exception { 
	  // convert intermediate data to output
	  
	  // Delete dir if it exists
	  FriendRecomendationDriver.deleteDirectory(outputDir);
	  
	  Job job = new Job();
	  job.setJarByClass(FriendRecomendationDriver.class);
	    
	  job.setMapperClass(finishMapper.class);
	  job.setReducerClass(finishReducer.class);
	    
	  job.setMapOutputKeyClass(Text.class);
	  job.setMapOutputValueClass(Text.class);
	    
	  job.setOutputKeyClass(Text.class);
	  job.setOutputValueClass(Text.class);
	  
	  // Use to sort the values without own implementation
	  job.setNumReduceTasks(1);
	    
	  FileInputFormat.addInputPath(job, new Path(inputDir));
	  FileOutputFormat.setOutputPath(job, new Path(outputDir));
	  
	  // Run the job
	  job.waitForCompletion(true);
  }
  
  public static void composite(String inDir, String outDir, String intDir1, String intDir2, String diffDir, int numRed) 
  	throws Exception
  {
	  // Runs the entire algorithm
	  // Hyperparameters
	  double minDiff = 2; // 0.001; //30;
	  int epochSize = 5;
	  int totalEpochs = 20;
	  
	  // Initialize the data
	  FriendRecomendationDriver.init(inDir, intDir1, numRed);
	  
	  // Dir 1 should always have most recent values
	  do {
		// Run iterations, multiple to not take on cost of diff as often
		for (int i = 0; i < epochSize; i++) {
			FriendRecomendationDriver.iter(intDir1, intDir2, numRed);
			String temp = intDir1;
			intDir1 = intDir2;
			intDir2 = temp;
		}
		totalEpochs -= epochSize;
		FriendRecomendationDriver.diff(intDir1, intDir2, diffDir, outDir, numRed);
		
		// Swap directories so data is now in proper place for operations
		String temp = intDir1;
		intDir1 = intDir2;
		intDir2 = temp;
	  } while (!FriendRecomendationDriver.converged(diffDir, minDiff) && totalEpochs > 0);
	  FriendRecomendationDriver.finish(intDir2, outDir, numRed);
  }
  
  // Checks if algorithm has reached convergence
  public static boolean converged(String dir, double diff) throws Exception {
	  return FriendRecomendationDriver.readDiffResult(dir) < diff;
  }

  // Given an output folder, returns the first double from the first part-r-00000 file
  static double readDiffResult(String path) throws Exception 
  {
    double diffnum = 0.0;
    Path diffpath = new Path(path);
    Configuration conf = new Configuration();
    FileSystem fs = FileSystem.get(URI.create(path),conf);
    
    if (fs.exists(diffpath)) {
      FileStatus[] ls = fs.listStatus(diffpath);
      for (FileStatus file : ls) {
	if (file.getPath().getName().startsWith("part-r-00000")) {
	  FSDataInputStream diffin = fs.open(file.getPath());
	  BufferedReader d = new BufferedReader(new InputStreamReader(diffin));
	  String diffcontent = d.readLine();
	  diffnum = Double.parseDouble(diffcontent);
	  d.close();
	}
      }
    }
    
    fs.close();
    return diffnum;
  }

  static void deleteDirectory(String path) throws Exception {
    Path todelete = new Path(path);
    Configuration conf = new Configuration();
    FileSystem fs = FileSystem.get(URI.create(path),conf);
    
    if (fs.exists(todelete)) 
      fs.delete(todelete, true);
      
    fs.close();
  }

}
