// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

contract FoodSafe
{
    struct Location{
        string Name;
        uint LocationId;
        uint PreviousLocationId;
        uint Timestamp;
        string Secret;
        string PreviousContractAddress;
    }
    
    mapping(uint => Location) Trail;
    uint8 TrailCount=0;

    // 添加信息
    function AddNewLocation(uint LocationId, string memory Name, string memory Secret,string memory preAddress) public
    {
        Location memory newLocation;
        newLocation.Name = Name;
        newLocation.LocationId= LocationId;
        newLocation.Secret= Secret;
        newLocation.Timestamp = block.timestamp;
        newLocation.PreviousContractAddress = preAddress;
        if(TrailCount!=0)
        {
            newLocation.PreviousLocationId= Trail[TrailCount].LocationId;
        }
        Trail[TrailCount] = newLocation;
        TrailCount++;
    }

    function GetTrailCount() public view returns(uint8){
        return TrailCount;
    }

    // 返回信息
    function GetLocation(uint8 TrailNo) public view returns (string memory, uint, uint, uint, string memory, string memory)
    {
        return (Trail[TrailNo].Name, Trail[TrailNo].LocationId, Trail[TrailNo].PreviousLocationId, Trail[TrailNo].Timestamp,Trail[TrailNo].Secret,Trail[TrailNo].PreviousContractAddress);
    }
}