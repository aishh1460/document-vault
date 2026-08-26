package com.examly.springapp;

import org.junit.jupiter.api.Test;
import com.examly.springapp.configuration.FileStorageProperties;
import static org.junit.jupiter.api.Assertions.*;

class FileStoragePropertiesTest {

    @Test
    void SpringBoot_ProjectAnalysisAndUMLDiagram_testDefaultConstructorAndSetters() {
        FileStorageProperties props = new FileStorageProperties();
        props.setLocation("uploads");
        assertEquals("uploads", props.getLocation());
    }

    @Test
    void SpringBoot_ProjectAnalysisAndUMLDiagram_testLocationIsInitiallyNull() {
        FileStorageProperties props = new FileStorageProperties();
        assertNull(props.getLocation(), "Location should be null by default");
    }

    @Test
    void SpringBoot_ProjectAnalysisAndUMLDiagram_testSetLocationUpdatesValue() {
        FileStorageProperties props = new FileStorageProperties();
        props.setLocation("testDir");
        assertEquals("testDir", props.getLocation());

        props.setLocation("newDir");
        assertEquals("newDir", props.getLocation());
    }

    @Test
    void SpringBoot_ProjectAnalysisAndUMLDiagram_testSettingEmptyString() {
        FileStorageProperties props = new FileStorageProperties();
        props.setLocation("");
        assertEquals("", props.getLocation(), "Empty string should be allowed");
    }

    @Test
    void SpringBoot_ProjectAnalysisAndUMLDiagram_testSettingWhitespaceLocation() {
        FileStorageProperties props = new FileStorageProperties();
        props.setLocation("   ");
        assertEquals("   ", props.getLocation(), "Whitespace should be stored as is");
    }

    @Test
    void SpringBoot_ProjectAnalysisAndUMLDiagram_testSettingNullLocation() {
        FileStorageProperties props = new FileStorageProperties();
        props.setLocation(null);
        assertNull(props.getLocation(), "Null should be allowed");
    }

    @Test
    void SpringBoot_ProjectAnalysisAndUMLDiagram_testMultipleInstancesHaveSeparateValues() {
        FileStorageProperties props1 = new FileStorageProperties();
        FileStorageProperties props2 = new FileStorageProperties();

        props1.setLocation("dir1");
        props2.setLocation("dir2");

        assertEquals("dir1", props1.getLocation());
        assertEquals("dir2", props2.getLocation());
    }

    @Test
    void SpringBoot_ProjectAnalysisAndUMLDiagram_testOverwritingLocationMultipleTimes() {
        FileStorageProperties props = new FileStorageProperties();
        props.setLocation("A");
        props.setLocation("B");
        props.setLocation("C");
        assertEquals("C", props.getLocation());
    }

    @Test
    void SpringBoot_ProjectAnalysisAndUMLDiagram_testCaseSensitivityOfLocation() {
        FileStorageProperties props = new FileStorageProperties();
        props.setLocation("Uploads");
        assertNotEquals("uploads", props.getLocation());
    }

    @Test
    void SpringBoot_ProjectAnalysisAndUMLDiagram_testLocationPersistenceInSameObject() {
        FileStorageProperties props = new FileStorageProperties();
        props.setLocation("myFolder");
        String before = props.getLocation();
        String after = props.getLocation();
        assertSame(before, after, "Getter should return the same reference for repeated calls");
    }
}
