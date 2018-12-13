package edu.upenn.nets212.hw3;

import java.io.DataInput;
import java.io.DataOutput;
import java.io.IOException;
import java.util.LinkedList;
import java.util.List;

import org.apache.hadoop.io.DoubleWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.io.Writable;

/**
 * URLGeocodeWritable -- wrapper for serializing URL + lat/long geocode
 * @author zives
 * @author ahae
 *
 */
public class GraphWritable implements Writable {
	
  private DoubleWritable rank;
  private Iterable<DoubleWritable> vertices;

  public GraphWritable() {
    set (new DoubleWritable(1), new LinkedList<DoubleWritable>());
  }

  public GraphWritable(Double rank, List<DoubleWritable> vertices) {
    set (new DoubleWritable(rank), vertices);
  }

  public GraphWritable(Double rank) {
    set (new DoubleWritable(rank), new LinkedList<DoubleWritable>());
  }
  
  public GraphWritable(List<DoubleWritable> vertices) {
	  set (new DoubleWritable(1), vertices);
  }

  public Iterable<DoubleWritable> getVertices() {
    return this.vertices;
  }

  public DoubleWritable getRank() {
    return this.rank;
  }

  public void set(DoubleWritable r, Iterable<DoubleWritable> v) {
    rank = r;
    vertices = v;
  }

  public void readFields(DataInput arg0) throws IOException {
    rank.readFields(arg0);
  }

  public void write(DataOutput arg0) throws IOException {
    rank.write(arg0);
    for (DoubleWritable d : vertices) {
    	d.write(arg0);
    }
  }

  @Override
  public int hashCode() {
    return (int)rank.get() * 163 + (vertices.hashCode() ^ vertices.hashCode());
  }

  @Override
  public String toString() {
    return rank + "\t(" + vertices + ")";
  }

  @Override
  public boolean equals(Object o) {
    if (!(o instanceof GraphWritable))
      return false;
    
    GraphWritable u = (GraphWritable)o;
    return u.rank == rank && u.vertices.equals(vertices);
  }
}

