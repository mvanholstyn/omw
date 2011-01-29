//
//  main.m
//  omw
//
//  Created by Mark Van Holstyn on 1/29/11.
//  Copyright Mutually Human Software 2011. All rights reserved.
//

#import <UIKit/UIKit.h>

int main(int argc, char *argv[]) {
    
    NSAutoreleasePool * pool = [[NSAutoreleasePool alloc] init];
    int retVal = UIApplicationMain(argc, argv, nil, @"omwAppDelegate");
    [pool release];
    return retVal;
}
