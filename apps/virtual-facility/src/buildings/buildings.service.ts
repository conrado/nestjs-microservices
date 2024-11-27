import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { Building } from './entities/building.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateWorkflowDto } from '@app/workflows';

@Injectable()
export class BuildingsService {
  constructor(
    @InjectRepository(Building)
    private buildingsRepository: Repository<Building>,
  ) {}

  findAll() {
    return this.buildingsRepository.find();
  }

  async findOne(id: number) {
    const building = await this.buildingsRepository.findOne({ where: { id } });
    if (!building) {
      throw new NotFoundException(`Building #${id} not found`);
    }
    return building;
  }

  async create(createBuildingDto: CreateBuildingDto): Promise<Building> {
    const building = this.buildingsRepository.create(createBuildingDto);
    const newBuildingEntity = await this.buildingsRepository.save(building);

    // Create a workflow for the new building
    await this.createWorkflow(newBuildingEntity.id);
    return newBuildingEntity;
  }

  async update(
    id: number,
    updateBuildingDto: UpdateBuildingDto,
  ): Promise<Building> {
    const building = await this.buildingsRepository.preload({
      id: +id,
      ...updateBuildingDto,
    });

    if (!building) {
      throw new NotFoundException(`Building #${id} not found`);
    }
    return this.buildingsRepository.save(building);
  }

  async remove(id: number) {
    const building = await this.findOne(id);
    return this.buildingsRepository.remove(building);
  }

  async createWorkflow(buildingId: number) {
    console.log(
      JSON.stringify({ name: 'My Workflow', buildingId } as CreateWorkflowDto),
    );
    const response = await fetch('http://workflows-service:3001/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'My Workflow', buildingId }),
    });
    const newWorkflow = await response.json();
    console.log({ newWorkflow });
    return newWorkflow;
  }
}
